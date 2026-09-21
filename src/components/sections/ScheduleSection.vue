<script setup>
// 项目进度页是纯展示组件，items 由统一数据文件提供。
defineProps({ items: { type: Array, required: true } })
</script>

<template>
  <section class="page-section schedule-section">
    <div class="section-heading schedule-heading"><h2>IN<br /><em>PROGRESS</em></h2><p class="section-meta">Schedule / 04</p></div>
    <!-- 每个条目用背景图铺满固定行高，遮罩在悬停时减淡以显示制作细节。 -->
    <div class="schedule-list"><article v-for="item in items" :key="item.id" class="schedule-item" :style="{ backgroundImage: `url(${item.image})` }"><div class="schedule-overlay"></div><span>{{ item.label }}</span></article></div>
  </section>
</template>
