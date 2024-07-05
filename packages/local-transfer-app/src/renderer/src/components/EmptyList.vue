<template>
  <div class="empty-list">
    <img src="@assets/image/Empty.png" />
    <div>{{ title ?? '暂无数据' }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<style scoped lang="scss">
.empty-list {
  @include flex(column, center, center);
  @include size();
  @include padding();
  gap: 1.2rem;
  flex-shrink: 0;
  color: var(--td-text-color-secondary);
  font-size: 1.6rem;

  img {
    width: 100%;
    height: auto;
  }
}
</style>
