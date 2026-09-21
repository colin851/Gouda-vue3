<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({ product: { type: Object, required: true }, productIndex: { type: Number, required: true }, productCount: { type: Number, required: true } })
const emit = defineEmits(['close', 'navigate'])
const overlay = ref(null)
const scroller = ref(null)
const closeButton = ref(null)

function onKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab') return

  const focusable = [...(overlay.value?.querySelectorAll('button, a[href]') ?? [])]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

function navigate(direction) {
  emit('navigate', direction)
  nextTick(() => scroller.value?.scrollTo({ top: 0 }))
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  closeButton.value?.focus()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div ref="overlay" class="detail-overlay" role="dialog" aria-modal="true" :aria-label="product.name">
    <div class="detail-toolbar"><button ref="closeButton" class="close-button" aria-label="关闭详情" @click="emit('close')">Close</button><span class="detail-count">{{ String(productIndex + 1).padStart(2, '0') }} / {{ String(productCount).padStart(2, '0') }}</span></div>
    <div ref="scroller" class="detail-scroller">
      <header class="detail-header"><h2>{{ product.shortName }}</h2><p class="section-meta">Selected work</p><p>{{ product.name }}</p></header>
      <div class="detail-gallery"><img v-for="(image, index) in product.images" :key="image" class="detail-image" :src="image" :alt="`${product.name} ${index + 1}`" loading="lazy" decoding="async" @error="$event.target.src = '/img/defualt.jpg'" /></div>
      <div class="detail-navigation"><button @click="navigate(-1)">Previous project</button><button @click="navigate(1)">Next project</button></div>
    </div>
  </div>
</template>
