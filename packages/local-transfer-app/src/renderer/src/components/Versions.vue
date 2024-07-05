<script setup lang="ts">
import { reactive } from 'vue';
import ListTile from './ListTile.vue';

const versions = reactive({ ...window.electron.process.versions });
</script>

<template>
  <div class="versions">
    <ListTile class="item" direction="row" gap="1rem">
      Electron
      <template #secondary>v{{ versions.electron }}</template>
    </ListTile>
    <ListTile class="item" direction="row" gap="1rem">
      Chromium
      <template #secondary>v{{ versions.chrome }}</template>
    </ListTile>
    <ListTile class="item" direction="row" gap="1rem">
      Node.js
      <template #secondary>v{{ versions.node }}</template>
    </ListTile>
  </div>
</template>

<style scoped lang="scss">
.versions {
  @include flex(column, flex-start, flex-start);
  width: 100%;

  .item {
    /* border-bottom: 1px solid var(--td-border-level-1-color); */
    border-radius: 0.8rem;
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
