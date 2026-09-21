<script setup>
import { defineAsyncComponent } from 'vue'

const HeroScene = defineAsyncComponent(() => import('../webgl/HeroScene.vue'))

defineProps({ featuredProduct: { type: Object, required: true } })
defineEmits(['open-product'])
</script>

<template>
  <section class="page-section hero-section">
    <div class="hero-wordmark" aria-label="GoudaText"><span>GOUDA</span><span>TEXT</span></div>
    <HeroScene src="/img/bg1.png" alt="Banshee Norn Gundam" />
    <div class="hero-copy"><h1>BANSHEE<br />NORN</h1><p>1 / 60 PG</p><button class="primary-action" @click="$emit('open-product', featuredProduct)">View project</button></div>
    <p class="hero-counter">Selected work <strong>01</strong> / 06</p>
  </section>
</template>
