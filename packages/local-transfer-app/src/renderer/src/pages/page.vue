<template>
  <div>Hello Index</div>
</template>

<script setup lang="ts">
import interact from '@renderer/utils/interact';
import { onMounted } from 'vue';

onMounted(() => {
  interact.dialog({
    body: 'Hello Dialog'
  });
});
</script>

<style scoped></style>
