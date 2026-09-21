<script setup>
// 左侧（移动端为顶部）主导航：展示当前页面状态，并把点击目标索引交给父组件。
defineProps({ currentSection: { type: Number, required: true }, sections: { type: Array, required: true } })
defineEmits(['navigate'])
</script>

<template>
  <aside class="nav-head" aria-label="主导航">
    <!-- 品牌按钮始终回到索引 0 的首页。 -->
    <button class="brand-button" :class="{ active: currentSection === 0 }" aria-label="返回首页" @click="$emit('navigate', 0, -1)">
      <img class="nav-logo" src="/img/logo-min.png" alt="GoudaText" />
    </button>
    <!-- sections 不包含首页，因此显示索引和导航索引都需要加 1。 -->
    <nav class="nav-list">
      <button v-for="(label, index) in sections" :key="label" class="nav-item" :class="{ active: currentSection === index + 1 }" @click="$emit('navigate', index + 1)">
        <span class="nav-index">0{{ index + 1 }}</span><span>{{ label }}</span>
      </button>
    </nav>
    <p class="nav-caption">Gunpla studio<br />Est. 2014</p>
  </aside>
</template>
