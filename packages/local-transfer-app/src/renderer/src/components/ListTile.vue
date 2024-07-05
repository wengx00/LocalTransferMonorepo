<template>
  <div
    class="list-tile"
    :style="{
      flexDirection: direction ?? 'column',
      alignItems: direction === 'row' ? 'center' : 'flex-start',
      gap: gap ?? '0.1rem'
    }"
  >
    <div
      class="list-tile_primary"
      :style="{
        width: direction === 'row' ? 'fit-content' : '100%'
      }"
    >
      <slot name="default"></slot>
    </div>
    <div class="list-tile_secondary">
      <slot name="secondary"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  default: () => any;
  secondary: () => any;
}>();
defineProps<{
  direction?: 'row' | 'column';
  gap?: string;
}>();
</script>

<style scoped lang="scss">
.list-tile {
  @include flex(column, flex-start, flex-start);
  @include padding(0.8rem);
  width: 100%;
  overflow: hidden;
  gap: 0.1rem;

  &_primary {
    font-size: 1.7rem;
    flex-shrink: 0;
    color: var(--td-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &_secondary {
    font-size: 1.4rem;
    flex: 1 0;
    color: var(--td-text-color-placeholder);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
