<template>
  <div class="container">
    <PageHeader title="隔空投送" />
    <div class="airdrop-aio">
      <SectionCard class="services-root">
        <template #title>
          <div class="header">
            设备列表
            <RefreshIcon
              class="refresh"
              :class="{
                spin: refreshSpin
              }"
              @click="refresh"
            />
          </div>
        </template>
        <ListTile v-for="item in serviceInfo.availableServices" :key="item.id">
          {{ item.name }}
          <template #secondary> {{ item.ip }} : {{ item.port }} </template>
        </ListTile>
      </SectionCard>
      <SectionCard class="files-root">
        <template #title>
          <div class="header">
            投送文件
            <t-button size="small">
              <template #icon>
                <CloudUploadIcon />
              </template>
              AirDrop
            </t-button>
          </div>
        </template>
        <FileSelectorAio multiple style="height: 20rem" @select="selectFile" />
        <div class="content">
          <t-popup v-for="(item, index) in filePaths" :key="item" :content="item">
            <div class="selected">
              <div class="filename">
                {{ item }}
              </div>
              <CloseIcon class="close" @click="cancelFile(index)" />
            </div>
          </t-popup>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import serviceApi from '@renderer/apis/service';
import FileSelectorAio from '@renderer/components/FileSelectorAio.vue';
import ListTile from '@renderer/components/ListTile.vue';
import PageHeader from '@renderer/components/PageHeader.vue';
import SectionCard from '@renderer/components/SectionCard.vue';
import interact from '@renderer/utils/interact';
import { useServiceInfo } from '@store/service-info';
import { CloseIcon, CloudUploadIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { ref } from 'vue';

const serviceInfo = useServiceInfo();
const filePaths = ref<string[]>([]);

const refreshSpin = ref(false);

// 刷新可用设备
async function refresh() {
  if (refreshSpin.value) {
    return;
  }
  refreshSpin.value = true;
  setTimeout(() => {
    refreshSpin.value = false;
  }, 500);
  try {
    await serviceApi.invoke.refresh();
    interact.message.success('设备列表刷新成功');
  } catch {
    interact.message.error('设备列表刷新失败，请稍后重试');
  }
}

// 选择文件
function selectFile(paths: string[]) {
  const curPaths = new Set(filePaths.value);
  for (const path of paths) {
    if (!curPaths.has(path)) {
      curPaths.add(path);
    }
  }
  filePaths.value = Array.from(curPaths);
}

// 取消选择文件
function cancelFile(index: number) {
  filePaths.value.splice(index, 1);
}
</script>

<style scoped lang="scss">
.container {
  @include flex(column, flex-start, flex-start);
  @include size();
  @include padding(1.2rem);
  flex-shrink: 0;
  overflow: hidden;
  gap: 1.2rem;
}

.airdrop-aio {
  @include flex(row, flex-start, flex-start);
  width: 100%;
  flex: 1 0;
  gap: 1.2rem;
  overflow: hidden;

  .services-root {
    @include flex(column, flex-start, flex-start);
    height: 100%;
    flex: 1 0;
    overflow: hidden;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .header {
      @include flex(row, space-between, center);
      width: 100%;
      flex-shrink: 0;
    }

    .refresh {
      cursor: pointer;

      &:hover {
        color: var(--td-brand-color);
      }
      &.spin {
        animation: spin 1s linear infinite;
      }
    }
  }

  .files-root {
    @include flex(column, flex-start, flex-start);
    height: 100%;
    flex: 2 0;
    overflow: hidden;
    gap: 1.2rem;

    .header {
      @include flex(row, space-between, center);
      width: 100%;
      flex-shrink: 0;
    }

    .content {
      @include flex(column, flex-start, flex-start);
      flex: 1 0;
      width: 100%;
      overflow: hidden;
      overflow-y: auto;
    }

    .selected {
      @include flex(row, space-between, center);
      @include padding(0.4rem);
      flex-shrink: 0;
      border-radius: 0.4rem;
      background-color: #f6f6f6;
      font-size: 1.4rem;
      color: #333;
      width: 100%;
      overflow: hidden;
      margin-top: 0.8rem;
      gap: 0.8rem;
      cursor: pointer;

      .filename {
        flex: 1 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .close {
        flex-shrink: 0;
        transition: all 0.3s;

        &:hover {
          color: var(--td-brand-color);
        }
      }
    }
  }
}
</style>
