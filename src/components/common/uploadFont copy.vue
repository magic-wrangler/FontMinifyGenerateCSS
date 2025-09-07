<template>
  <div class="flex flex-col p-16px">
    <div
      type="file"
      class="flex flex-col items-center gap-24px rounded-8px border-2px border-dashed border-[#364963] px-24px py-56px"
      hover="border-[#254633] cursor-pointer"
      role="button"
    >
      <input type="file" class="hidden" />
      <div class="flex max-w-[480px] flex-col items-center gap-2">
        <p
          class="text-white text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center"
        >
          Drag and drop font files here
        </p>
        <p
          class="text-white text-sm font-normal leading-normal max-w-[480px] text-center"
        >
          Supports woff, woff2, ttf, otf
        </p>
      </div>
      <button
        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#253346] text-white text-sm font-bold leading-normal tracking-[0.015em]"
      >
        <span class="truncate">Select Files</span>
      </button>
    </div>
  </div>
  <div id="upload-dragger-reconst">
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="true"
      :accept="'.woff,.woff2,.ttf,.otf'"
      :max-count="1"
      @change="handleChange"
      @drop="handleDrop"
      class="flex flex-col p-16px"
      hover="border-[#254633] cursor-pointer"
    >
      <div
        class="flex flex-col flex-shrink-0 gap-16px items-center justify-center"
      >
        <div>
          <p class="text-white text4-sem text-center font-Space_Grotesk">
            Drag and drop font files here
          </p>
          <p class="text-white text6-reg text-center font-Space_Grotesk">
            Supports woff, woff2, ttf, otf
          </p>
        </div>
        <button
          class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#253346] text-white text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span class="truncate">Select Files</span>
        </button>
      </div>
    </a-upload-dragger>
  </div>
</template>

<script setup lang="ts">
import { UploadDragger as AUploadDragger } from 'ant-design-vue';
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import type { UploadChangeParam } from 'ant-design-vue';
const fileList = ref([]);
const handleChange = (info: UploadChangeParam) => {
  const status = info.file.status;
  if (status !== 'uploading') {
    console.log(info.file, info.fileList);
  }
  if (status === 'done') {
    message.success(`${info.file.name} file uploaded successfully.`);
  } else if (status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};
function handleDrop(e: DragEvent) {
  console.log(e);
}
</script>

<style scoped lang="less"></style>
<style>
#upload-dragger-reconst {
  .ant-upload-drag {
    @apply flex;
    @apply flex-col;
    @apply items-center;
    @apply gap-24px;
    @apply rounded-8px;
    @apply border-2px;
    @apply border-dashed;
    @apply border-[#364963];
    @apply px-24px;
    @apply py-56px;
  }
}
</style>
