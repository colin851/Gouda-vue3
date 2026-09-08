<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { products, scheduleItems } from './data/products'

const sectionNames = ['Profile', 'Gallery', 'Schedule']
const currentSection = ref(0)
const selectedProduct = ref(null)
const activeProductIndex = ref(0)
const sectionRefs = []
const detailScroller = ref(null)
const touchStart = ref(null)
const isTransitioning = ref(false)
let wheelLockTimer

const activeProduct = computed(() => products[activeProductIndex.value])

function setSectionRef(element, index) { if (element) sectionRefs[index] = element }

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

function onWheel(event) {
  if (selectedProduct.value || isTransitioning.value) return
  event.preventDefault()
  if (wheelLockTimer || Math.abs(event.deltaY) < 12) return
  wheelLockTimer = window.setTimeout(() => { wheelLockTimer = null }, 900)
  const direction = event.deltaY > 0 ? 1 : -1
  goToSection(currentSection.value + direction, direction)
}

function onTouchStart(event) { if (event.touches.length === 1) touchStart.value = event.touches[0].clientY }
function onTouchEnd(event) {
  if (touchStart.value === null || selectedProduct.value) return
  const delta = touchStart.value - event.changedTouches[0].clientY
  touchStart.value = null
  if (Math.abs(delta) < 45) return
  const direction = delta > 0 ? 1 : -1
  goToSection(currentSection.value + direction, direction)
}

function openProduct(product) {
  selectedProduct.value = product
  nextTick(() => detailScroller.value?.scrollTo({ top: 0 }))
}
function closeProduct() { selectedProduct.value = null }
function nextProduct(direction) { activeProductIndex.value = (activeProductIndex.value + direction + products.length) % products.length }
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
function onKeydown(event) {
  if (event.key === 'Escape' && selectedProduct.value) closeProduct()
  if (selectedProduct.value) return
  if (event.key === 'ArrowDown' || event.key === 'PageDown') goToSection(currentSection.value + 1, 1)
  if (event.key === 'ArrowUp' || event.key === 'PageUp') goToSection(currentSection.value - 1, -1)
}

onMounted(() => {
  sectionRefs.forEach((section, index) => gsap.set(section, { yPercent: index === 0 ? 0 : 100, autoAlpha: index === 0 ? 1 : 0 }))
  gsap.from('.hero-copy > *', { y: 32, autoAlpha: 0, duration: 0.8, stagger: 0.1, delay: 0.25, ease: 'power3.out' })
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (wheelLockTimer) window.clearTimeout(wheelLockTimer)
})
</script>

<template>
  <div class="app-shell" @wheel="onWheel" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <aside class="nav-head" aria-label="主导航">
      <button class="brand-button" aria-label="返回首页" @click="goToSection(0, -1)"><img class="nav-logo" src="/img/logo-min.png" alt="GoudaText" /></button>
      <nav class="nav-list">
        <button v-for="(label, index) in sectionNames" :key="label" class="nav-item" :class="{ active: currentSection === index + 1 }" @click="goToSection(index + 1)">
          <span class="nav-index">0{{ index + 1 }}</span><span>{{ label }}</span>
        </button>
      </nav>
      <p class="nav-caption">GUNPLA / STUDIO</p>
    </aside>

    <main class="section-viewport" aria-live="polite">
      <section :ref="(element) => setSectionRef(element, 0)" class="page-section hero-section">
        <div class="hero-copy"><p class="eyebrow">MASTER LEVEL GUNPLA</p><h1>GUNDAM</h1><p class="hero-subtitle"><span>BANSHEE</span> NORN</p><button class="gold-button" @click="openProduct(products[0])">VIEW MORE <span>↗</span></button></div>
        <img class="hero-image" src="/img/bg1.png" alt="Banshee Norn Gundam" /><div class="hero-grid" aria-hidden="true"></div>
      </section>

      <section :ref="(element) => setSectionRef(element, 1)" class="page-section profile-section">
        <div class="profile-grid">
          <div class="profile-copy reveal-item"><p class="eyebrow">01 / PROFILE</p><h2>GUNPLA<br /><em>END PRODUCT</em></h2><p>To offer the highest level of GUNPLA products, we share our views of GUNPLA with every client and obsess over every detail.</p></div>
          <div class="profile-divider" aria-hidden="true"></div>
          <div class="profile-copy reveal-item"><p class="eyebrow">02 / DEVELOPMENT</p><h2>GARAGE KIT<br /><em>DEVELOPMENT</em></h2><p>Professional research and technical skills help us develop garage kits with rich details and a distinctive point of view.</p></div>
        </div>
        <div class="contact-block reveal-item"><span class="contact-icon">✉</span><a href="mailto:shen@maniac-studio.com">shen@maniac-studio.com</a></div><img class="profile-logo" src="/img/logo-lg.png" alt="GoudaText Studio" />
      </section>

      <section :ref="(element) => setSectionRef(element, 2)" class="page-section gallery-section">
        <div class="section-heading"><p class="eyebrow">03 / GALLERY</p><h2>SELECTED <em>WORKS</em></h2></div>
        <div class="gallery-stage"><button class="gallery-arrow gallery-arrow--prev" aria-label="上一个作品" @click="nextProduct(-1)">←</button><button class="gallery-arrow gallery-arrow--next" aria-label="下一个作品" @click="nextProduct(1)">→</button>
          <button v-for="(product, index) in products" :key="product.id" class="product-card" :class="{ 'is-active': index === activeProductIndex }" :style="cardStyle(index)" @click="index === activeProductIndex ? openProduct(product) : (activeProductIndex = index)"><img :src="product.cover" :alt="product.name" loading="lazy" @error="$event.target.src = '/img/defualt.jpg'" /><span class="product-mask"></span></button>
        </div>
        <button class="gallery-title" @click="openProduct(activeProduct)">{{ activeProduct.name }} <span>↗</span></button>
      </section>

      <section :ref="(element) => setSectionRef(element, 3)" class="page-section schedule-section">
        <div class="section-heading schedule-heading"><p class="eyebrow">04 / SCHEDULE</p><h2>IN <em>PROGRESS</em></h2></div>
        <div class="schedule-list"><article v-for="item in scheduleItems" :key="item.id" class="schedule-item" :style="{ backgroundImage: `url(${item.image})` }"><div class="schedule-overlay"></div><span>{{ item.label }}</span></article></div>
      </section>
    </main>

    <Transition name="detail-fade"><div v-if="selectedProduct" class="detail-overlay" role="dialog" aria-modal="true" :aria-label="selectedProduct.name">
      <div class="detail-toolbar"><button class="close-button" aria-label="关闭详情" @click="closeProduct">× <span>CLOSE</span></button><span class="detail-count">{{ products.indexOf(selectedProduct) + 1 }} / {{ products.length }}</span></div>
      <div ref="detailScroller" class="detail-scroller"><header class="detail-header"><p class="eyebrow">SELECTED WORK</p><h2>{{ selectedProduct.shortName }}</h2><p>{{ selectedProduct.name }}</p></header><div class="detail-gallery"><img v-for="(image, index) in selectedProduct.images" :key="image" class="detail-image" :src="image" :alt="`${selectedProduct.name} ${index + 1}`" loading="lazy" decoding="async" @error="$event.target.src = '/img/defualt.jpg'" /></div><div class="detail-navigation"><button @click="nextProduct(-1); selectedProduct = activeProduct">← PREV</button><button @click="nextProduct(1); selectedProduct = activeProduct">NEXT →</button></div></div>
    </div></Transition>
  </div>
</template>
