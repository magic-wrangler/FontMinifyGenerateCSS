<template>
  <div class="flex flex-col p-16px">
    <div
      ref="dropArea"
      type="file"
      class="flex flex-col items-center gap-24px rounded-8px border-2px border-dashed border-[#364963] px-24px py-56px"
      hover="border-[#254633] cursor-pointer"
      role="button"
    >
      <input ref="fileInput" type="file" class="hidden" :accept="accept" :multiple="multiple" />
      <div class="flex max-w-[480px] flex-col items-center gap-2">
        <p
          class="text-white text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center"
        >
          {{ title }}
        </p>
        <p
          class="text-white text-sm font-normal leading-normal max-w-[480px] text-center"
        >
          {{ desc }}
        </p>
      </div>
      <button
        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#253346] text-white text-sm font-bold leading-normal tracking-[0.015em]"
        @click="onChange"
        >
        <span class="truncate"> {{ btnText }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UploadFontProps {
  /** 标题 */
  title: string;
  /** 描述 */
  desc: string;
  /** 按钮文字 */
  btnText?: string;
  /** 接受的文件类型 .woff,.woff2,.ttf,.otf */
  accept?: string;
  /** 是否支持多选 */
  multiple?: boolean;
  /** v-model绑定的文件数据 */
  modelValue?: FileList | null;
}

const props = withDefaults(defineProps<UploadFontProps>(), {
  btnText: 'Select Files',
  accept: '',
  multiple: false,
  modelValue: null,
});

// 定义事件
const emit = defineEmits<{
  /** 文件选择变化事件 */
  (e: 'change', files: FileList | null): void;
  /** v-model更新事件 */
  (e: 'update:modelValue', files: FileList | null): void;
}>();

// input 上传文件Ref
const fileInputRef = useTemplateRef('fileInput');

// 虚线区域Ref
const dropAreaRef = useTemplateRef('dropArea');

/**
 * 选择文件
 */
const onChange = (e: any) => {
  e.preventDefault();
  fileInputRef.value?.click();
}

/**
 * 监听文件选择变化
 */
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  // 向父组件发送选中的文件
  emit('change', files);
  // 更新v-model绑定的值
  emit('update:modelValue', files);
}

/**
 * 点击虚线区域触发文件选择
 */
const handleDropAreaClick = (e: MouseEvent) => {
  // 如果点击的是按钮或按钮内的元素，不触发文件选择
  const target = e.target as HTMLElement;
  const button = document.querySelector('button');
  if (button && (button === target || button.contains(target))) {
    return;
  }
  
  // 否则触发文件选择
  fileInputRef.value?.click();
}

/**
 * 拖放事件处理
 */
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 添加拖拽悬停样式
  dropAreaRef.value?.classList.add('border-[#254633]');
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 移除拖拽悬停样式
  dropAreaRef.value?.classList.remove('border-[#254633]');
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 移除拖拽悬停样式
  dropAreaRef.value?.classList.remove('border-[#254633]');
  
  // 获取拖放的文件
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    // 如果不支持多选且拖放了多个文件，只取第一个
    if (!props.multiple && files.length > 1) {
      const singleFile = new DataTransfer();
      singleFile.items.add(files[0]);
      // 更新文件输入框的值
      if (fileInputRef.value) {
        fileInputRef.value.files = singleFile.files;
      }
      // 触发事件
      emit('change', singleFile.files);
      emit('update:modelValue', singleFile.files);
    } else {
      // 更新文件输入框的值
      if (fileInputRef.value) {
        fileInputRef.value.files = files;
      }
      // 触发事件
      emit('change', files);
      emit('update:modelValue', files);
    }
  }
};

// 为虚线区域添加事件监听
onMounted(() => {
  const dropArea = dropAreaRef.value;
  if (dropArea) {
    // 点击事件
    dropArea.addEventListener('click', handleDropAreaClick);
    // 拖放事件
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
  }
  // 添加文件选择变化事件监听
  fileInputRef.value?.addEventListener('change', handleFileChange);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  const dropArea = dropAreaRef.value;
  if (dropArea) {
    // 移除点击事件
    dropArea.removeEventListener('click', handleDropAreaClick);
    // 移除拖放事件
    dropArea.removeEventListener('dragover', handleDragOver);
    dropArea.removeEventListener('dragleave', handleDragLeave);
    dropArea.removeEventListener('drop', handleDrop);
  }
  // 移除文件选择变化事件监听
  fileInputRef.value?.removeEventListener('change', handleFileChange);
});
</script>

<style scoped lang="less"></style>
