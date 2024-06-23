<template>
  <div>Hello Index</div>
</template>

<script setup lang="ts">
import serviceApi from '@apis/service';
import interact from '@renderer/utils/interact';
import { onMounted } from 'vue';

function demoInvoke() {
  serviceApi.invoke.addVerifiedDevice('123');
}

onMounted(() => {
  demoInvoke();
  interact.dialog({
    body: 'Hello Dialog'
  });
});
</script>

<style scoped></style>
