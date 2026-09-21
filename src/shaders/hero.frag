precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uPointer;
uniform float uInteraction;
uniform float uTime;
varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  float screenAspect = uResolution.x / uResolution.y;
  float textureAspect = uTextureSize.x / uTextureSize.y;

  if (screenAspect > textureAspect) {
    uv.y = (uv.y - 0.5) * textureAspect / screenAspect + 0.5;
  } else {
    uv.x = (uv.x - 0.5) * screenAspect / textureAspect + 0.5;
  }
  return uv;
}

void main() {
  vec2 uv = coverUv(vUv);
  vec2 autoCursor = vec2(
    0.58 + sin(uTime * 0.48) * 0.11,
    0.52 + cos(uTime * 0.37) * 0.09
  );
  vec2 screenCursor = mix(autoCursor, uPointer + 0.5, uInteraction);
  vec2 cursorUv = coverUv(screenCursor);

  vec2 screenDelta = vUv - screenCursor;
  screenDelta.x *= uResolution.x / uResolution.y;
  float lensDistance = length(screenDelta);
  float lensRadius = 0.19 + sin(uTime * 1.4) * 0.006;
  float lensMask = 1.0 - smoothstep(lensRadius - 0.018, lensRadius, lensDistance);
  float lensRing = 1.0 - smoothstep(0.0, 0.007, abs(lensDistance - lensRadius));
  float outerRing = 1.0 - smoothstep(0.0, 0.0025, abs(lensDistance - lensRadius - 0.015));

  vec2 lensDirection = normalize(uv - cursorUv + vec2(0.0001));
  vec2 magnifiedUv = cursorUv + (uv - cursorUv) * 0.925;
  float refraction = sin(lensDistance * 115.0 - uTime * 3.2) * 0.0016 * lensMask;
  vec2 sampleUv = mix(uv, magnifiedUv, lensMask) + lensDirection * refraction;

  vec4 subject = texture2D(uTexture, sampleUv);
  float aberration = lensRing * 0.0032;
  vec3 color = vec3(
    texture2D(uTexture, sampleUv + lensDirection * aberration).r,
    subject.g,
    texture2D(uTexture, sampleUv - lensDirection * aberration).b
  );

  // Lift the source shadows without flattening the gold and white armor highlights.
  color = pow(max(color, vec3(0.0)), vec3(0.76)) * 1.12;
  color = mix(color, color * vec3(0.94, 1.07, 1.13) + vec3(0.01, 0.025, 0.035), lensMask * 0.42);

  vec3 cyan = vec3(0.08, 0.82, 1.0);
  vec3 magenta = vec3(1.0, 0.12, 0.56);
  float angle = atan(screenDelta.y, screenDelta.x) / 6.2831853 + 0.5;
  float ringTicks = step(0.58, fract(angle * 28.0 + uTime * 0.12));

  vec2 grid = abs(fract(vUv * uResolution / 34.0) - 0.5);
  float gridLines = 1.0 - smoothstep(0.455, 0.5, max(grid.x, grid.y));
  gridLines *= lensMask * 0.075;

  float scanPosition = fract(uTime * 0.16 + 0.12);
  float scanDistance = abs(vUv.y - scanPosition);
  float scanGlow = 1.0 - smoothstep(0.005, 0.055, scanDistance);
  float scanCore = 1.0 - smoothstep(0.0, 0.004, scanDistance);

  vec2 texel = 2.0 / uTextureSize;
  float nearbyAlpha = max(
    max(texture2D(uTexture, sampleUv + vec2(texel.x, 0.0)).a, texture2D(uTexture, sampleUv - vec2(texel.x, 0.0)).a),
    max(texture2D(uTexture, sampleUv + vec2(0.0, texel.y)).a, texture2D(uTexture, sampleUv - vec2(0.0, texel.y)).a)
  );
  float edge = max(nearbyAlpha - subject.a, 0.0);

  vec3 background = vec3(0.035, 0.043, 0.047);
  vec3 finalColor = mix(background, color, subject.a);
  finalColor += cyan * (lensRing * (0.24 + ringTicks * 0.5) + outerRing * ringTicks * 0.34);
  finalColor += mix(cyan, magenta, angle) * edge * lensMask * 0.8;
  finalColor += cyan * gridLines * (0.35 + subject.a * 0.65);
  finalColor += cyan * scanGlow * subject.a * 0.18;
  finalColor += vec3(0.72, 0.94, 1.0) * scanCore * subject.a * 0.28;

  gl_FragColor = vec4(finalColor, 1.0);
}
