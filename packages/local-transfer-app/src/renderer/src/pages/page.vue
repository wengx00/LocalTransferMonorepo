<template>
  <div class="app">
    <Sidebar />
    <t-footer class="footer"
      >Copyright @ 2024-{{ new Date().getFullYear() }} LocalTransfer. All Rights Reserved</t-footer
    >
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue';
</script>

<style scoped>
.app {
  height: 90vh;
  flex-direction: row;
}

.footer {
  display: flex;
  justify-content: center;
  background-color: #ffffff;
  height: 10vh;
  box-shadow: 0px 0px 5px 1px rgb(0, 0, 0);
}
</style>
