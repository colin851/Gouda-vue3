<script setup>
import { computed, nextTick, ref } from 'vue'
import AppNavigation from './components/AppNavigation.vue'
import ProjectDetail from './components/project/ProjectDetail.vue'
import GallerySection from './components/sections/GallerySection.vue'
import HeroSection from './components/sections/HeroSection.vue'
import ProfileSection from './components/sections/ProfileSection.vue'
import ScheduleSection from './components/sections/ScheduleSection.vue'
import { useSectionNavigation } from './composables/useSectionNavigation'
import { products, scheduleItems } from './data/products'

const sectionNames = ['Profile', 'Gallery', 'Schedule']
const activeProductIndex = ref(0)
const selectedProductIndex = ref(null)
const lastFocusedElement = ref(null)
const selectedProduct = computed(() => selectedProductIndex.value === null ? null : products[selectedProductIndex.value])

const {
  currentSection,
  goToSection,
  onTouchCancel,
  onTouchEnd,
  onTouchStart,
  onWheel,
  setSectionRef,
} = useSectionNavigation({
  sectionCount: sectionNames.length + 1,
  isBlocked: () => selectedProductIndex.value !== null,
})

function openProduct(product) {
  const index = products.findIndex(({ id }) => id === product.id)
  if (index < 0) return
  activeProductIndex.value = index
  selectedProductIndex.value = index
  lastFocusedElement.value = document.activeElement
}

function closeProduct() {
  selectedProductIndex.value = null
  nextTick(() => lastFocusedElement.value?.focus())
}

function navigateProduct(direction, fromDetail = false) {
  const sourceIndex = fromDetail ? selectedProductIndex.value : activeProductIndex.value
  const nextIndex = (sourceIndex + direction + products.length) % products.length
  activeProductIndex.value = nextIndex
  if (fromDetail) selectedProductIndex.value = nextIndex
}
</script>

<template>
  <div class="app-shell" @wheel="onWheel" @touchstart="onTouchStart" @touchend="onTouchEnd" @touchcancel="onTouchCancel">
    <AppNavigation :current-section="currentSection" :sections="sectionNames" @navigate="goToSection" />

    <main class="section-viewport" aria-live="polite">
      <HeroSection :ref="(element) => setSectionRef(element?.$el, 0)" :featured-product="products[0]" @open-product="openProduct" />
      <ProfileSection :ref="(element) => setSectionRef(element?.$el, 1)" />
      <GallerySection :ref="(element) => setSectionRef(element?.$el, 2)" :products="products" :active-index="activeProductIndex" @update:active-index="activeProductIndex = $event" @open-product="openProduct" @navigate-product="navigateProduct" />
      <ScheduleSection :ref="(element) => setSectionRef(element?.$el, 3)" :items="scheduleItems" />
    </main>

    <Transition name="detail-fade">
      <ProjectDetail v-if="selectedProduct" :product="selectedProduct" :product-index="selectedProductIndex" :product-count="products.length" @close="closeProduct" @navigate="navigateProduct($event, true)" />
    </Transition>
  </div>
</template>
