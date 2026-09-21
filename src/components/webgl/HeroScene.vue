<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import vertexShader from '../../shaders/hero.vert?raw'
import fragmentShader from '../../shaders/hero.frag?raw'

const props = defineProps({ src: { type: String, required: true }, alt: { type: String, required: true } })

const container = ref(null)
const canvas = ref(null)
const isReady = ref(false)
const scene = new THREE.Scene()
const camera = new THREE.Camera()
const pointerTarget = new THREE.Vector2()
const pointerCurrent = new THREE.Vector2()
let interactionTarget = 0
let interactionCurrent = 0

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
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  material.uniforms.uResolution.value.set(Math.max(width, 1), Math.max(height, 1))
  render()
}

function render(time = startTime ?? 0) {
  if (!renderer || !material) return
  pointerCurrent.lerp(pointerTarget, 0.08)
  interactionCurrent += (interactionTarget - interactionCurrent) * 0.08
  material.uniforms.uPointer.value.copy(pointerCurrent)
  material.uniforms.uInteraction.value = interactionCurrent
  material.uniforms.uTime.value = ((time || startTime) - startTime) / 1000
  renderer.render(scene, camera)
}

function animate(time) {
  render(time)
  animationFrame = window.requestAnimationFrame(animate)
}

function onPointerMove(event) {
  if (reduceMotion || !container.value) return
  const bounds = container.value.getBoundingClientRect()
  pointerTarget.set(
    (event.clientX - bounds.left) / bounds.width - 0.5,
    0.5 - (event.clientY - bounds.top) / bounds.height,
  )
  interactionTarget = 1
}

function onPointerLeave() {
  interactionTarget = 0
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: false, powerPreference: 'high-performance' })
  } catch {
    return
  }

  geometry = new THREE.PlaneGeometry(2, 2)
  texture = new THREE.TextureLoader().load(
    props.src,
    (loadedTexture) => {
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

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container.value)
})

onBeforeUnmount(() => {
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
    <img class="hero-image" :src="src" :alt="alt" />
    <canvas ref="canvas" class="hero-canvas" :class="{ ready: isReady }" aria-hidden="true"></canvas>
  </div>
</template>
