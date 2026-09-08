<script setup>
// 这个组件是整个作品集页面的状态与交互中枢：
// - 三个输入方向（滚轮、触摸滑动、键盘）最终都调用 goToSection；
// - 作品卡片和详情弹层共用 products 中的同一份数据；
// - GSAP 只负责过渡动画，当前页面索引仍由 Vue 状态维护。
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { products, scheduleItems } from './data/products'

// 导航文字只描述“页面”，实际索引从 1 开始；首页（Profile 之前）固定使用索引 0。
const sectionNames = ['Profile', 'Gallery', 'Schedule']
const currentSection = ref(0)

// selectedProduct 为 null 时不显示详情弹层；非 null 时弹层展示该作品的完整图片集。
const selectedProduct = ref(null)
const activeProductIndex = ref(0)

// sectionRefs 与 currentSection 使用同一套索引，便于动画时同时找到进场和退场节点。
const sectionRefs = []
const detailScroller = ref(null)
const touchStart = ref(null)
const isTransitioning = ref(false)
let wheelLockTimer

// 详情弹层中的“下一个/上一个”直接复用画廊当前作品索引。
const activeProduct = computed(() => products[activeProductIndex.value])

// Vue 的函数式 ref 会在节点创建/销毁时多次触发，因此只在有节点时写入数组。
function setSectionRef(element, index) { if (element) sectionRefs[index] = element }

/**
 * 在 0~3 的合法范围内切换页面。
 * direction 决定新页面从屏幕上方还是下方进入，也决定旧页面离场方向。
 * 动画期间忽略新的切换请求，避免两个 GSAP 时间线同时修改同一节点。
 */
function goToSection(index, direction = index > currentSection.value ? 1 : -1) {
  const nextIndex = Math.max(0, Math.min(3, index))
  if (nextIndex === currentSection.value || isTransitioning.value) return
  isTransitioning.value = true
  const oldIndex = currentSection.value
  const incoming = sectionRefs[nextIndex]
  const outgoing = sectionRefs[oldIndex]
  gsap.set(incoming, { yPercent: direction * 100, autoAlpha: 1 })
  gsap.timeline({ defaults: { duration: 0.8, ease: 'power3.inOut' }, onComplete: () => { currentSection.value = nextIndex; isTransitioning.value = false } })
    .to(outgoing, { yPercent: direction * -100, autoAlpha: 0 }, 0)
    .to(incoming, { yPercent: 0, autoAlpha: 1 }, 0)
}

// 滚轮事件绑定在最外层容器；弹层打开时让详情区域自行滚动，不抢夺页面滚轮。
function onWheel(event) {
  if (selectedProduct.value || isTransitioning.value) return
  event.preventDefault()
  // 小幅度滚动通常来自触控板惯性，忽略它可以避免一次手势连续翻过多页。
  if (wheelLockTimer || Math.abs(event.deltaY) < 12) return
  wheelLockTimer = window.setTimeout(() => { wheelLockTimer = null }, 900)
  const direction = event.deltaY > 0 ? 1 : -1
  goToSection(currentSection.value + direction, direction)
}

// 只记录单指触摸的起点；多指操作交给浏览器处理，避免误触发页面切换。
function onTouchStart(event) { if (event.touches.length === 1) touchStart.value = event.touches[0].clientY }
function onTouchEnd(event) {
  if (touchStart.value === null || selectedProduct.value) return
  const delta = touchStart.value - event.changedTouches[0].clientY
  touchStart.value = null
  // 低于阈值的移动视为点击或轻微拖动，不进行整页切换。
  if (Math.abs(delta) < 45) return
  const direction = delta > 0 ? 1 : -1
  goToSection(currentSection.value + direction, direction)
}

// 打开详情后等待 DOM 更新，再把滚动位置重置到作品图片集的顶部。
function openProduct(product) {
  selectedProduct.value = product
  nextTick(() => detailScroller.value?.scrollTo({ top: 0 }))
}
function closeProduct() { selectedProduct.value = null }

// 使用取模实现首尾循环，这样详情页和画廊都能从任意作品继续浏览。
function nextProduct(direction) { activeProductIndex.value = (activeProductIndex.value + direction + products.length) % products.length }

// 根据作品与当前卡片的距离计算层叠卡片的 CSS 变量和视觉强调程度。
function cardStyle(index) {
  const offset = index - activeProductIndex.value
  const distance = Math.min(Math.abs(offset), 2)
  return {
    '--card-index': offset,
    '--card-scale': 1 - distance * 0.16,
    opacity: Math.max(0.16, 1 - distance * 0.42),
    zIndex: 10 - distance,
  }
}

// 弹层打开时仅保留 Escape 关闭；弹层关闭后，方向键/PageUp/PageDown 可切换整页。
function onKeydown(event) {
  if (event.key === 'Escape' && selectedProduct.value) closeProduct()
  if (selectedProduct.value) return
  if (event.key === 'ArrowDown' || event.key === 'PageDown') goToSection(currentSection.value + 1, 1)
  if (event.key === 'ArrowUp' || event.key === 'PageUp') goToSection(currentSection.value - 1, -1)
}

onMounted(() => {
  // 首屏可见，其余页面先放到下方并隐藏；后续 goToSection 会复用这些初始状态。
  sectionRefs.forEach((section, index) => gsap.set(section, { yPercent: index === 0 ? 0 : 100, autoAlpha: index === 0 ? 1 : 0 }))
  // 首屏文案只做一次入场动画，不参与页面切换时间线。
  gsap.from('.hero-copy > *', { y: 32, autoAlpha: 0, duration: 0.8, stagger: 0.1, delay: 0.25, ease: 'power3.out' })
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  // 组件销毁时移除全局监听，并清理滚轮节流定时器，避免残留回调访问已销毁状态。
  window.removeEventListener('keydown', onKeydown)
  if (wheelLockTimer) window.clearTimeout(wheelLockTimer)
})
</script>

<template>
  <div class="app-shell" @wheel="onWheel" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <!-- 固定侧栏：桌面端占据左侧 240px，移动端由 CSS 收缩为顶部导航。 -->
    <aside class="nav-head" aria-label="主导航">
      <button class="brand-button" aria-label="返回首页" @click="goToSection(0, -1)"><img class="nav-logo" src="/img/logo-min.png" alt="GoudaText" /></button>
      <nav class="nav-list">
        <button v-for="(label, index) in sectionNames" :key="label" class="nav-item" :class="{ active: currentSection === index + 1 }" @click="goToSection(index + 1)">
          <span class="nav-index">0{{ index + 1 }}</span><span>{{ label }}</span>
        </button>
      </nav>
      <p class="nav-caption">GUNPLA / STUDIO</p>
    </aside>

    <!-- 所有全屏页面都叠放在同一个 viewport 中，由 GSAP 控制 yPercent 和透明度。 -->
    <main class="section-viewport" aria-live="polite">
      <!-- 首页只负责品牌展示和进入首个作品详情。 -->
      <section :ref="(element) => setSectionRef(element, 0)" class="page-section hero-section">
        <div class="hero-copy"><p class="eyebrow">MASTER LEVEL GUNPLA</p><h1>GUNDAM</h1><p class="hero-subtitle"><span>BANSHEE</span> NORN</p><button class="gold-button" @click="openProduct(products[0])">VIEW MORE <span>↗</span></button></div>
        <img class="hero-image" src="/img/bg1.png" alt="Banshee Norn Gundam" /><div class="hero-grid" aria-hidden="true"></div>
      </section>

      <!-- Profile 页面展示工作室定位与联系方式。 -->
      <section :ref="(element) => setSectionRef(element, 1)" class="page-section profile-section">
        <div class="profile-grid">
          <div class="profile-copy reveal-item"><p class="eyebrow">01 / PROFILE</p><h2>GUNPLA<br /><em>END PRODUCT</em></h2><p>To offer the highest level of GUNPLA products, we share our views of GUNPLA with every client and obsess over every detail.</p></div>
          <div class="profile-divider" aria-hidden="true"></div>
          <div class="profile-copy reveal-item"><p class="eyebrow">02 / DEVELOPMENT</p><h2>GARAGE KIT<br /><em>DEVELOPMENT</em></h2><p>Professional research and technical skills help us develop garage kits with rich details and a distinctive point of view.</p></div>
        </div>
        <div class="contact-block reveal-item"><span class="contact-icon">✉</span><a href="mailto:shen@maniac-studio.com">shen@maniac-studio.com</a></div><img class="profile-logo" src="/img/logo-lg.png" alt="GoudaText Studio" />
      </section>

      <!-- Gallery 页面只维护当前索引；卡片位置、缩放和透明度由 cardStyle 派生。 -->
      <section :ref="(element) => setSectionRef(element, 2)" class="page-section gallery-section">
        <div class="section-heading"><p class="eyebrow">03 / GALLERY</p><h2>SELECTED <em>WORKS</em></h2></div>
        <div class="gallery-stage"><button class="gallery-arrow gallery-arrow--prev" aria-label="上一个作品" @click="nextProduct(-1)">←</button><button class="gallery-arrow gallery-arrow--next" aria-label="下一个作品" @click="nextProduct(1)">→</button>
          <button v-for="(product, index) in products" :key="product.id" class="product-card" :class="{ 'is-active': index === activeProductIndex }" :style="cardStyle(index)" @click="index === activeProductIndex ? openProduct(product) : (activeProductIndex = index)"><img :src="product.cover" :alt="product.name" loading="lazy" @error="$event.target.src = '/img/defualt.jpg'" /><span class="product-mask"></span></button>
        </div>
        <button class="gallery-title" @click="openProduct(activeProduct)">{{ activeProduct.name }} <span>↗</span></button>
      </section>

      <!-- Schedule 页面使用独立数据源展示进行中的项目列表。 -->
      <section :ref="(element) => setSectionRef(element, 3)" class="page-section schedule-section">
        <div class="section-heading schedule-heading"><p class="eyebrow">04 / SCHEDULE</p><h2>IN <em>PROGRESS</em></h2></div>
        <div class="schedule-list"><article v-for="item in scheduleItems" :key="item.id" class="schedule-item" :style="{ backgroundImage: `url(${item.image})` }"><div class="schedule-overlay"></div><span>{{ item.label }}</span></article></div>
      </section>
    </main>

    <!-- 详情弹层覆盖整个应用，但内部 scroller 独立滚动，避免影响背景页面。 -->
    <Transition name="detail-fade"><div v-if="selectedProduct" class="detail-overlay" role="dialog" aria-modal="true" :aria-label="selectedProduct.name">
      <div class="detail-toolbar"><button class="close-button" aria-label="关闭详情" @click="closeProduct">× <span>CLOSE</span></button><span class="detail-count">{{ products.indexOf(selectedProduct) + 1 }} / {{ products.length }}</span></div>
      <div ref="detailScroller" class="detail-scroller"><header class="detail-header"><p class="eyebrow">SELECTED WORK</p><h2>{{ selectedProduct.shortName }}</h2><p>{{ selectedProduct.name }}</p></header><div class="detail-gallery"><img v-for="(image, index) in selectedProduct.images" :key="image" class="detail-image" :src="image" :alt="`${selectedProduct.name} ${index + 1}`" loading="lazy" decoding="async" @error="$event.target.src = '/img/defualt.jpg'" /></div><div class="detail-navigation"><button @click="nextProduct(-1); selectedProduct = activeProduct">← PREV</button><button @click="nextProduct(1); selectedProduct = activeProduct">NEXT →</button></div></div>
    </div></Transition>
  </div>
</template>
