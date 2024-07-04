<template>
  <div class="page-header">
    <div class="page-header_title">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped lang="scss">
.page-header {
  @include flex(column, flex-start, flex-start);
  @include padding(0.8rem);
  width: 100%;
  flex-shrink: 0;

  &_title {
    font-size: 1.7rem;
    font-weight: 700;
    color: #333;
  }
}
</style>
