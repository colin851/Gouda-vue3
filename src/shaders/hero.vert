// 把平面的 UV 原样传给 fragment shader；模型坐标已经覆盖完整裁剪空间。
varying vec2 vUv;

void main() {
  vUv = uv;
  // 不经过投影矩阵，PlaneGeometry(-1~1) 直接铺满整个 Canvas。
  gl_Position = vec4(position, 1.0);
}
