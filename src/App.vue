<script setup>
// 应用根组件：组合四个全屏页面，并维护跨页面共享的导航与作品选择状态。
// 具体页面展示、详情交互和 WebGL 渲染分别下沉到对应组件，避免根组件承担实现细节。
import { computed, nextTick, ref } from 'vue'
import AppNavigation from './components/AppNavigation.vue'
import ProjectDetail from './components/project/ProjectDetail.vue'
import GallerySection from './components/sections/GallerySection.vue'
import HeroSection from './components/sections/HeroSection.vue'
import ProfileSection from './components/sections/ProfileSection.vue'
import ScheduleSection from './components/sections/ScheduleSection.vue'
import { useSectionNavigation } from './composables/useSectionNavigation'
import { products, scheduleItems } from './data/products'

// 首页固定占索引 0，以下名称依次对应索引 1~3；页面总数由数组长度推导，避免硬编码边界。
const sectionNames = ['Profile', 'Gallery', 'Schedule']

// products 是唯一作品数据源：画廊和详情只保存索引，不复制或改写作品对象。
const activeProductIndex = ref(0)
const selectedProductIndex = ref(null)
const lastFocusedElement = ref(null)
const selectedProduct = computed(() => selectedProductIndex.value === null ? null : products[selectedProductIndex.value])

// 弹层打开时阻止底层页面切换，滚轮、触摸和键盘导航统一由 composable 管理。
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
  // 同步画廊和详情索引，关闭详情后用户仍停留在刚查看的作品。
  activeProductIndex.value = index
  selectedProductIndex.value = index
  lastFocusedElement.value = document.activeElement
}

function closeProduct() {
  selectedProductIndex.value = null
  // 等弹层从 DOM 移除后，把键盘焦点还给打开它的按钮。
  nextTick(() => lastFocusedElement.value?.focus())
}

function navigateProduct(direction, fromDetail = false) {
  const sourceIndex = fromDetail ? selectedProductIndex.value : activeProductIndex.value
  // 加上数组长度后再取模，让 Previous/Next 在首尾之间循环。
  const nextIndex = (sourceIndex + direction + products.length) % products.length
  activeProductIndex.value = nextIndex
  if (fromDetail) selectedProductIndex.value = nextIndex
}
</script>

<template>
  <div class="app-shell" @wheel="onWheel" @touchstart="onTouchStart" @touchend="onTouchEnd" @touchcancel="onTouchCancel">
    <!-- 固定导航只派发目标索引，页面切换动画仍由根组件的 composable 统一处理。 -->
    <AppNavigation :current-section="currentSection" :sections="sectionNames" @navigate="goToSection" />

    <!-- 四个页面绝对定位在同一视口中，组件根节点注册给 GSAP 进行整页切换。 -->
    <main class="section-viewport" aria-live="polite">
      <HeroSection :ref="(element) => setSectionRef(element?.$el, 0)" :featured-product="products[0]" @open-product="openProduct" />
      <ProfileSection :ref="(element) => setSectionRef(element?.$el, 1)" />
      <GallerySection :ref="(element) => setSectionRef(element?.$el, 2)" :products="products" :active-index="activeProductIndex" @update:active-index="activeProductIndex = $event" @open-product="openProduct" @navigate-product="navigateProduct" />
      <ScheduleSection :ref="(element) => setSectionRef(element?.$el, 3)" :items="scheduleItems" />
    </main>

    <!-- selectedProduct 为 null 时不渲染弹层；Transition 只负责淡入淡出。 -->
    <Transition name="detail-fade">
      <ProjectDetail v-if="selectedProduct" :product="selectedProduct" :product-index="selectedProductIndex" :product-count="products.length" @close="closeProduct" @navigate="navigateProduct($event, true)" />
    </Transition>
  </div>
</template>
