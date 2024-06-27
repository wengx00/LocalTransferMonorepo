<template>
  <div class="root">
    <div class="row">设备ID: {{ serviceId }}</div>
    <div class="row">
      <div style="flex-shrink: 0">设备名称：</div>
      <t-input v-model="serviceName" placeholder="未指定设备名称" />
      <t-button style="flex-shrink: 0" :disabled="serviceName.length === 0" @click="setServiceName">
        修改名称
      </t-button>
      <t-button style="flex-shrink: 0" theme="default" @click="getServiceName">获取名称</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import serviceApi from '@renderer/apis/service';
import interact from '@renderer/utils/interact';
import { onMounted } from 'vue';
import { ref } from 'vue';

const serviceId = ref('');
const serviceName = ref('');

// 修改设备名称
function setServiceName() {
  serviceApi.invoke
    .setName(serviceName.value)
    .then(() => {
      interact.message.success('设备名称修改成功');
    })
    .catch(async (err) => {
      interact.message.error(String(err));
      serviceName.value = await serviceApi.invoke.getName();
    });
}

// 获取设备名称
async function getServiceName() {
  serviceName.value = await serviceApi.invoke.getName();
}

onMounted(async () => {
  serviceId.value = await serviceApi.invoke.getId();
  await getServiceName();
});
</script>

<style lang="scss" scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.2rem;
  gap: 1.2rem;
  overflow-x: hidden;
  overflow-y: auto;

  .row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.6rem;
  }
}
</style>
