precision highp float;

// HeroScene 传入的运行时数据：原图、画布/纹理尺寸、指针状态与动画时间。
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uPointer;
uniform float uInteraction;
uniform float uTime;
varying vec2 vUv;

// 模拟 CSS object-fit: cover：保持图片比例，并裁掉超出画布的方向。
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

  // 无指针输入时圆镜自动沿椭圆巡航；用户交互后平滑切换为跟随指针。
  vec2 autoCursor = vec2(
    0.58 + sin(uTime * 0.48) * 0.11,
    0.52 + cos(uTime * 0.37) * 0.09
  );
  vec2 screenCursor = mix(autoCursor, uPointer + 0.5, uInteraction);
  vec2 cursorUv = coverUv(screenCursor);

  // 用屏幕宽高比修正 X 轴距离，确保不同视口中的扫描镜始终为正圆。
  vec2 screenDelta = vUv - screenCursor;
  screenDelta.x *= uResolution.x / uResolution.y;
  float lensDistance = length(screenDelta);
  float lensRadius = 0.19 + sin(uTime * 1.4) * 0.006;
  // 三个遮罩分别描述镜内区域、主环和外侧分段环，后续效果共用这套几何边界。
  float lensMask = 1.0 - smoothstep(lensRadius - 0.018, lensRadius, lensDistance);
  float lensRing = 1.0 - smoothstep(0.0, 0.007, abs(lensDistance - lensRadius));
  float outerRing = 1.0 - smoothstep(0.0, 0.0025, abs(lensDistance - lensRadius - 0.015));

  // 镜内纹理向中心收缩 7.5% 形成放大，再叠加低幅波纹模拟玻璃折射。
  vec2 lensDirection = normalize(uv - cursorUv + vec2(0.0001));
  vec2 magnifiedUv = cursorUv + (uv - cursorUv) * 0.925;
  float refraction = sin(lensDistance * 115.0 - uTime * 3.2) * 0.0016 * lensMask;
  vec2 sampleUv = mix(uv, magnifiedUv, lensMask) + lensDirection * refraction;

  // 只在镜环附近分离红蓝通道，制造能量边缘，同时保持主体大部分区域清晰。
  vec4 subject = texture2D(uTexture, sampleUv);
  float aberration = lensRing * 0.0032;
  vec3 color = vec3(
    texture2D(uTexture, sampleUv + lensDirection * aberration).r,
    subject.g,
    texture2D(uTexture, sampleUv - lensDirection * aberration).b
  );

  // 用 gamma 曲线抬高源图暗部，避免直接加白导致金色与白色装甲失去层次。
  color = pow(max(color, vec3(0.0)), vec3(0.76)) * 1.12;
  color = mix(color, color * vec3(0.94, 1.07, 1.13) + vec3(0.01, 0.025, 0.035), lensMask * 0.42);

  vec3 cyan = vec3(0.08, 0.82, 1.0);
  vec3 magenta = vec3(1.0, 0.12, 0.56);
  // 极坐标角度被切成 28 段，形成沿圆周旋转的仪表刻度。
  float angle = atan(screenDelta.y, screenDelta.x) / 6.2831853 + 0.5;
  float ringTicks = step(0.58, fract(angle * 28.0 + uTime * 0.12));

  // 网格按屏幕像素计算，因此桌面和移动端都保持约 34px 的视觉密度。
  vec2 grid = abs(fract(vUv * uResolution / 34.0) - 0.5);
  float gridLines = 1.0 - smoothstep(0.455, 0.5, max(grid.x, grid.y));
  gridLines *= lensMask * 0.075;

  // 水平扫描线循环穿过画布，合成阶段会用 alpha 限制在机体内部。
  float scanPosition = fract(uTime * 0.16 + 0.12);
  float scanDistance = abs(vUv.y - scanPosition);
  float scanGlow = 1.0 - smoothstep(0.005, 0.055, scanDistance);
  float scanCore = 1.0 - smoothstep(0.0, 0.004, scanDistance);

  // 比较相邻纹理像素的 alpha，提取透明 PNG 的机体外轮廓。
  vec2 texel = 2.0 / uTextureSize;
  float nearbyAlpha = max(
    max(texture2D(uTexture, sampleUv + vec2(texel.x, 0.0)).a, texture2D(uTexture, sampleUv - vec2(texel.x, 0.0)).a),
    max(texture2D(uTexture, sampleUv + vec2(0.0, texel.y)).a, texture2D(uTexture, sampleUv - vec2(0.0, texel.y)).a)
  );
  float edge = max(nearbyAlpha - subject.a, 0.0);

  // 最终按顺序合成：提亮主体、扫描镜圆环、轮廓色散、网格和水平扫描线。
  vec3 background = vec3(0.035, 0.043, 0.047);
  vec3 finalColor = mix(background, color, subject.a);
  finalColor += cyan * (lensRing * (0.24 + ringTicks * 0.5) + outerRing * ringTicks * 0.34);
  finalColor += mix(cyan, magenta, angle) * edge * lensMask * 0.8;
  finalColor += cyan * gridLines * (0.35 + subject.a * 0.65);
  finalColor += cyan * scanGlow * subject.a * 0.18;
  finalColor += vec3(0.72, 0.94, 1.0) * scanCore * subject.a * 0.28;

  gl_FragColor = vec4(finalColor, 1.0);
}
