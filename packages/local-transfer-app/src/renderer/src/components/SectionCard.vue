<template>
  <div class="section-card">
    <div class="section-card_title">
      <slot name="title"></slot>
    </div>
    <div class="section-card_content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  title?: () => any;
  default?: () => any;
}>();
</script>

<style scoped lang="scss">
.section-card {
  @include flex(column, flex-start, flex-start);
  @include padding(1.2rem 1.2rem);
  width: 100%;
  border-radius: 1.2rem;
  background-color: #fff;
  flex-shrink: 0;
  gap: 0.4rem;
  overflow: hidden;

  &_title {
    @include padding(0 0.8rem);
    width: 100%;
    flex-shrink: 0;
    color: var(--td-text-color-secondary);
  }
  &_content {
    @include flex(column, flex-start, flex-start);
    width: 100%;
    flex: 1 0;
    overflow: hidden;
  }
}
</style>
