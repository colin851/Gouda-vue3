<script setup>
defineProps({ items: { type: Array, required: true } })
</script>

<template>
  <section class="page-section schedule-section">
    <div class="section-heading schedule-heading"><h2>IN<br /><em>PROGRESS</em></h2><p class="section-meta">Schedule / 04</p></div>
    <div class="schedule-list"><article v-for="item in items" :key="item.id" class="schedule-item" :style="{ backgroundImage: `url(${item.image})` }"><div class="schedule-overlay"></div><span>{{ item.label }}</span></article></div>
  </section>
</template>
