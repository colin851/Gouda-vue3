<script setup>
// 全屏作品详情弹层：展示原图集、处理作品切换，并把键盘焦点限制在弹层内部。
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({ product: { type: Object, required: true }, productIndex: { type: Number, required: true }, productCount: { type: Number, required: true } })
const emit = defineEmits(['close', 'navigate'])
const overlay = ref(null)
const scroller = ref(null)
const closeButton = ref(null)

function onKeydown(event) {
  // Escape 是弹层唯一的全局关闭快捷键。
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab') return

  // Tab 到达末尾后回到开头，Shift+Tab 在开头时回到末尾，防止焦点落到底层页面。
  const focusable = [...(overlay.value?.querySelectorAll('button, a[href]') ?? [])]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

function navigate(direction) {
  emit('navigate', direction)
  // 切换项目后从新项目顶部开始浏览，避免沿用上一项目的滚动位置。
  nextTick(() => scroller.value?.scrollTo({ top: 0 }))
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // 打开弹层后立即聚焦关闭按钮，键盘用户无需穿过背景内容。
  closeButton.value?.focus()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div ref="overlay" class="detail-overlay" role="dialog" aria-modal="true" :aria-label="product.name">
    <!-- 工具栏固定在视口顶部，详情图片在下方独立滚动。 -->
    <div class="detail-toolbar"><button ref="closeButton" class="close-button" aria-label="关闭详情" @click="emit('close')">Close</button><span class="detail-count">{{ String(productIndex + 1).padStart(2, '0') }} / {{ String(productCount).padStart(2, '0') }}</span></div>
    <div ref="scroller" class="detail-scroller">
      <header class="detail-header"><h2>{{ product.shortName }}</h2><p class="section-meta">Selected work</p><p>{{ product.name }}</p></header>
      <!-- 大图启用原生懒加载，只有接近可视区域时才解码。 -->
      <div class="detail-gallery"><img v-for="(image, index) in product.images" :key="image" class="detail-image" :src="image" :alt="`${product.name} ${index + 1}`" loading="lazy" decoding="async" @error="$event.target.src = '/img/defualt.jpg'" /></div>
      <div class="detail-navigation"><button @click="navigate(-1)">Previous project</button><button @click="navigate(1)">Next project</button></div>
    </div>
  </div>
</template>
