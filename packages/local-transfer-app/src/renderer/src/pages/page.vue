<template>
  <div class="root">
    <h2>Hello Index</h2>
    <t-button @click="router.push('/test')">打开测试页面</t-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
.root {
  @include flex(column, flex-start, center);

  gap: 1.6rem;
}
</style>
