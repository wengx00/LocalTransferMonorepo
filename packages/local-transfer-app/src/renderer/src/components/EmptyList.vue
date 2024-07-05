<template>
  <div class="empty-list">
    <img :src="img ?? DefaultEmptyImage" />
    <div>{{ title ?? '暂无数据' }}</div>
  </div>
</template>

<script setup lang="ts">
import DefaultEmptyImage from '@assets/image/Empty.png';
defineProps<{
  title?: string;
  img?: string;
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
    width: 20rem;
    height: 20rem;
    object-fit: cover;
    object-position: center;
  }
}
</style>
