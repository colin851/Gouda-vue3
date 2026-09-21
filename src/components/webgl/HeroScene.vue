<script setup>
// 首屏 WebGL 渲染器：把透明 PNG 作为全屏纹理，交给自定义 shader 绘制交互扫描镜。
// 组件拥有并释放全部 GPU 资源；模板中的 img 是加载期间或 WebGL 不可用时的可见兜底。
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import vertexShader from '../../shaders/hero.vert?raw'
import fragmentShader from '../../shaders/hero.frag?raw'

const props = defineProps({ src: { type: String, required: true }, alt: { type: String, required: true } })

const container = ref(null)
const canvas = ref(null)
const isReady = ref(false)

// 顶点 shader 直接输出裁剪空间坐标，所以不需要透视相机或灯光。
const scene = new THREE.Scene()
const camera = new THREE.Camera()

// target 保存最新输入，current 每帧追赶 target，避免圆镜直接跳到指针位置。
const pointerTarget = new THREE.Vector2()
const pointerCurrent = new THREE.Vector2()
let interactionTarget = 0
let interactionCurrent = 0

// 这些对象都持有浏览器或 GPU 资源，必须在组件卸载时逐一清理。
let geometry
let material
let renderer
let texture
let resizeObserver
let animationFrame
let startTime
let reduceMotion

function resize() {
  if (!container.value || !renderer || !material) return
  const { width, height } = container.value.getBoundingClientRect()
  // 限制像素比可显著降低高分屏 fragment shader 的计算量，同时保持足够清晰。
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  material.uniforms.uResolution.value.set(Math.max(width, 1), Math.max(height, 1))
  render()
}

function render(time = startTime ?? 0) {
  if (!renderer || !material) return
  // 线性插值同时平滑镜头位置和自动/手动模式之间的切换。
  pointerCurrent.lerp(pointerTarget, 0.08)
  interactionCurrent += (interactionTarget - interactionCurrent) * 0.08
  material.uniforms.uPointer.value.copy(pointerCurrent)
  material.uniforms.uInteraction.value = interactionCurrent
  material.uniforms.uTime.value = ((time || startTime) - startTime) / 1000
  renderer.render(scene, camera)
}

function animate(time) {
  render(time)
  // 仅在允许动态效果时形成 RAF 循环；reduced-motion 模式只渲染静态首帧。
  animationFrame = window.requestAnimationFrame(animate)
}

function onPointerMove(event) {
  if (reduceMotion || !container.value) return
  const bounds = container.value.getBoundingClientRect()
  // shader 使用以画布中心为原点的 -0.5~0.5 坐标，Y 轴方向与 DOM 坐标相反。
  pointerTarget.set(
    (event.clientX - bounds.left) / bounds.width - 0.5,
    0.5 - (event.clientY - bounds.top) / bounds.height,
  )
  interactionTarget = 1
}

function onPointerLeave() {
  // 指针离开后让 shader 从手动位置平滑回到自动巡航轨迹。
  interactionTarget = 0
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  try {
    // WebGL 初始化可能因浏览器设置、驱动或资源限制失败；失败时保留静态 img。
    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: false, powerPreference: 'high-performance' })
  } catch {
    return
  }

  // 2×2 平面刚好覆盖 WebGL 的完整裁剪空间，所有视觉变换都在 fragment shader 中完成。
  geometry = new THREE.PlaneGeometry(2, 2)
  texture = new THREE.TextureLoader().load(
    props.src,
    (loadedTexture) => {
      // 使用图片真实尺寸计算 cover 裁切；纹理成功后才淡入 Canvas，避免闪烁空帧。
      material.uniforms.uTextureSize.value.set(loadedTexture.image.width, loadedTexture.image.height)
      isReady.value = true
      startTime = performance.now()
      resize()
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(animate)
    },
    undefined,
    () => { isReady.value = false },
  )
  texture.colorSpace = THREE.SRGBColorSpace

  // uniforms 是 Vue/Three.js 与 GLSL 之间的唯一运行时数据契约。
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uTextureSize: { value: new THREE.Vector2(1920, 1080) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2() },
      uInteraction: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
  })
  scene.add(new THREE.Mesh(geometry, material))

  // 监听容器而不是 window，布局或侧栏尺寸变化时也能同步渲染分辨率。
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container.value)
})

onBeforeUnmount(() => {
  // 停止动画并释放 GPU 对象，防止热更新或页面销毁后继续占用显存。
  if (animationFrame) window.cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  texture?.dispose()
  material?.dispose()
  geometry?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <div ref="container" class="hero-media" @pointermove="onPointerMove" @pointerleave="onPointerLeave">
    <!-- 静态图始终在 Canvas 下层，Canvas 只有纹理加载成功后才变为可见。 -->
    <img class="hero-image" :src="src" :alt="alt" />
    <canvas ref="canvas" class="hero-canvas" :class="{ ready: isReady }" aria-hidden="true"></canvas>
  </div>
</template>
