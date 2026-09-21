<script setup>
// 作品画廊页：直接消费 products 标准数据，并用 activeIndex 决定当前封面和标题。
import { computed } from 'vue'

const props = defineProps({ products: { type: Array, required: true }, activeIndex: { type: Number, required: true } })
const emit = defineEmits(['open-product', 'navigate-product', 'update:active-index'])
const activeProduct = computed(() => props.products[props.activeIndex])

function onPointerMove(event) {
  // 只在支持悬停且用户未要求减少动态时启用卡片透视，触屏设备保持稳定布局。
  if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
  const bounds = event.currentTarget.getBoundingClientRect()
  // 把指针位置归一化到 -0.5~0.5，再通过 CSS 变量驱动卡片和图片层产生视差。
  const x = (event.clientX - bounds.left) / bounds.width - 0.5
  const y = (event.clientY - bounds.top) / bounds.height - 0.5
  event.currentTarget.style.setProperty('--tilt-x', `${y * -7}deg`)
  event.currentTarget.style.setProperty('--tilt-y', `${x * 7}deg`)
  event.currentTarget.style.setProperty('--shift-x', `${x * 8}px`)
  event.currentTarget.style.setProperty('--shift-y', `${y * 8}px`)
}

function resetTilt(event) {
  // 移出卡片后删除行内变量，让 CSS 中的零值成为唯一默认状态。
  event.currentTarget.style.removeProperty('--tilt-x')
  event.currentTarget.style.removeProperty('--tilt-y')
  event.currentTarget.style.removeProperty('--shift-x')
  event.currentTarget.style.removeProperty('--shift-y')
}
</script>

<template>
  <section class="page-section gallery-section">
    <!-- 左侧标题固定，中央封面与右侧索引共同消费 activeProduct。 -->
    <div class="section-heading"><h2>SELECTED<br /><em>WORKS</em></h2><p class="section-meta">Gallery / 03</p></div>
    <div class="gallery-stage">
      <button class="gallery-visual" :aria-label="`查看 ${activeProduct.name}`" @click="emit('open-product', activeProduct)" @pointermove="onPointerMove" @pointerleave="resetTilt">
        <span class="gallery-image-plane"><img :key="activeProduct.id" :src="activeProduct.cover" :alt="activeProduct.name" @error="$event.target.src = '/img/defualt.jpg'" /></span>
        <span class="gallery-open">Open project</span>
      </button>
      <!-- 点击目录只更新当前索引，不创建作品对象副本。 -->
      <div class="gallery-index" aria-label="作品索引">
        <button v-for="(product, index) in products" :key="product.id" :class="{ active: index === activeIndex }" @click="emit('update:active-index', index)">
          <span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ product.shortName }}</strong>
        </button>
      </div>
    </div>
    <div class="gallery-footer"><p>{{ activeProduct.name }}</p><div><button aria-label="上一个作品" @click="emit('navigate-product', -1)">Previous</button><button aria-label="下一个作品" @click="emit('navigate-product', 1)">Next</button></div></div>
  </section>
</template>
