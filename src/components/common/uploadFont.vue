<template>
  <div class="flex flex-col p-16px">
    <!-- 未上传文件 - 展示 -->
    <div
      v-show="!modelValue?.length"
      ref="dropArea"
      type="file"
      class="flex flex-col items-center gap-24px rounded-8px border-2px border-dashed border-[#364963] px-24px py-56px"
      hover="border-[#254633] cursor-pointer"
      role="button"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
      />
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
      <FontButton @click="onChange">{{ btnText }}</FontButton>
    </div>

    <!-- 上传文件展示 -->
    <div v-show="!!modelValue?.length" class="flex flex-col flex-shrink-0 items-center gap-4">
      <TransitionGroup name="file-list" tag="div" class="w-full flex flex-col gap-4">
        <div v-for="(file, index) in fileInfoList" :key="file.name" class="flex flex-col w-full file-item">
          <div class="flex items-center gap-4 bg-[#1c3326] px-4 min-h-[72px] py-2 justify-between w-full rounded-lg">

            <div class="flex items-center gap-4">
              <div class="text-white flex items-center justify-center rounded-lg bg-[#254633] shrink-0 size-12">
                <img src="https://w1.gtimg.cn/wujicode/fx_drop_config/9b3ec3b6d0b77da38afbb9ef19bf0f0b/360172e3_ZfN6gUAodhx.svg" >
              </div>
              <div class="flex flex-col justify-center">
                <p class="text-white text-base font-medium leading-normal line-clamp-1">{{ file.name }}</p>
                <p class="text-[#95c6a9] text-sm font-normal leading-normal line-clamp-2">{{ formatFileSize(file.size) }}, {{ getFileExtension(file.name) }}</p>
              </div>
            </div>
            <div class="shrink-0">
              <div class="text-white flex size-7 items-center justify-center" hover="cursor-pointer" @click="deleteFile(index)">
                <img src="https://w1.gtimg.cn/wujicode/fx_drop_config/9b3ec3b6d0b77da38afbb9ef19bf0f0b/360172e3_3wbtWDK1PK8.svg">
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
      <FontButton class="mt-2" @click="onChange">{{ continueBtnText }}</FontButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, TransitionGroup } from 'vue';

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
  /** 继续上传按钮文案 */
  continueBtnText?: string;
}

interface FileInfo {
  file: File;
  name: string;
  size: number;
  content: string;
  showContent: boolean;
  loading: boolean;
  error: string | null;
  isBinary: boolean;
}

const props = withDefaults(defineProps<UploadFontProps>(), {
  btnText: 'Select Files',
  accept: '.woff,.woff2,.ttf,.otf',
  multiple: false,
  modelValue: null,
  continueBtnText:'Add More Files'
});

// 文件信息列表
const fileInfoList = ref<FileInfo[]>([]);

// 存储当前已上传的文件，用于检测重复文件
const uploadedFiles = ref<Map<string, File>>(new Map());

// 初始化上传文件Map
const initUploadedFiles = () => {
  // 清空已上传文件Map
  uploadedFiles.value.clear();
  
  // 如果有初始文件，添加到Map中
  if (props.modelValue) {
    for (let i = 0; i < props.modelValue.length; i++) {
      const file = props.modelValue[i];
      uploadedFiles.value.set(file.name, file);
    }
  }
};

// 监听文件变化，更新文件信息列表
watch(() => props.modelValue, (newFiles) => {
  if (!newFiles || newFiles.length === 0) {
    fileInfoList.value = [];
    uploadedFiles.value.clear();
    return;
  }
  
  // 创建文件信息列表
  const newFileInfoList: FileInfo[] = [];
  
  // 更新uploadedFiles，但不清空它，这样可以保留之前上传的文件信息
  // 只在组件初始化时清空一次
  
  for (let i = 0; i < newFiles.length; i++) {
    const file = newFiles[i];
    newFileInfoList.push({
      file,
      name: file.name,
      size: file.size,
      content: '',
      showContent: false,
      loading: false,
      error: null,
      isBinary: false
    });
    
    // 将文件添加到已上传文件Map中，以文件名为键
    uploadedFiles.value.set(file.name, file);
  }
  
  fileInfoList.value = newFileInfoList;
});

/**
 * 切换显示文件内容
 */
// const toggleFileContent = (index: number) => {
//   const fileInfo = fileInfoList.value[index];
//   if (!fileInfo) return;
  
//   // 切换显示状态
//   fileInfo.showContent = !fileInfo.showContent;
  
//   // 如果是显示内容且内容为空，则读取文件内容
//   if (fileInfo.showContent && !fileInfo.content && !fileInfo.loading && !fileInfo.error) {
//     readFileContent(index);
//   }
// };

/**
 * 读取文件内容
 */
// const readFileContent = async (index: number) => {
//   const fileInfo = fileInfoList.value[index];
//   if (!fileInfo || fileInfo.loading) return;
  
//   fileInfo.loading = true;
//   fileInfo.error = null;
  
//   // 判断文件类型，字体文件通常是二进制文件
//   const isFontFile = /\.(woff|woff2|ttf|otf)$/i.test(fileInfo.name);
  
//   try {
//     if (isFontFile) {
//       // 对于字体文件，使用专门的函数处理
//       try {
//         const fontInfo = await readFontFileContent(fileInfo.file);
//         fileInfo.content = fontInfo;
//         fileInfo.isBinary = false; // 我们显示的是文本信息，所以设为false
//       } catch (error) {
//         fileInfo.error = error as string;
//         fileInfo.isBinary = true;
//       }
//     } else {
//       // 其他文件尝试读取为文本
//       const reader = new FileReader();
      
//       reader.onload = (e) => {
//         fileInfo.loading = false;
        
//         try {
//           const content = e.target?.result as string;
//           fileInfo.content = content;
//           fileInfo.isBinary = false;
//         } catch (error) {
//           fileInfo.error = '无法读取文件内容';
//           console.error('读取文件内容错误:', error);
//         }
//       };
      
//       reader.onerror = () => {
//         fileInfo.loading = false;
//         fileInfo.error = '读取文件失败';
//         console.error('读取文件失败');
//       };
      
//       reader.readAsText(fileInfo.file);
//       return; // 异步读取，直接返回
//     }
//   } catch (error) {
//     fileInfo.error = '无法读取此类型的文件';
//     console.error('读取文件错误:', error);
//   }
  
//   fileInfo.loading = false; // 确保设置loading状态为false
// };

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * 获取文件扩展名
 */
const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

// 定义事件
const emit = defineEmits<{
  /** 文件选择变化事件 */
  (e: 'change', files: FileList | null): void;
  /** v-model更新事件 */
  (e: 'update:modelValue', files: FileList | null): void;
}>();

/**
 * 删除指定索引的文件
 */
const deleteFile = (index: number) => {
  if (index < 0 || !fileInfoList.value[index] || !props.modelValue) return;
  
  // 获取要删除的文件名
  const fileName = fileInfoList.value[index].name;
  
  // 从已上传文件Map中移除
  uploadedFiles.value.delete(fileName);
  
  // 创建新的FileList对象，不包含被删除的文件
  const dataTransfer = new DataTransfer();
  
  for (let i = 0; i < props.modelValue.length; i++) {
    const file = props.modelValue[i];
    // 跳过要删除的文件
    if (file.name !== fileName) {
      dataTransfer.items.add(file);
    }
  }
  
  const updatedFiles = dataTransfer.files;
  
  // 更新文件输入框的值
  if (fileInputRef.value) {
    fileInputRef.value.files = updatedFiles;
  }

  // 触发v-model更新事件
  emit('update:modelValue', updatedFiles);
  // 触发事件
  // emit('change', updatedFiles);
};

// input 上传文件Ref
const fileInputRef = useTemplateRef('fileInput');

// 虚线区域Ref
const dropAreaRef = useTemplateRef('dropArea');

/**
 * 选择文件
 */
const onChange = () => {
  // 点击文件选择按钮
  fileInputRef.value?.click();
};

/**
 * 监听文件选择变化
 */
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) return;
  
  // 将选择的文件转换为数组以便处理
  const selectedFiles: File[] = Array.from(files);
  
  // 使用processValidFiles函数处理文件，这样可以复用检查重复文件的逻辑
  processValidFiles(selectedFiles, false);
};

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
};
const hoverClass = '!border-[#254633]';
/**
 * 拖放事件处理
 */
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 添加拖拽悬停样式
  dropAreaRef.value?.classList.add(hoverClass);
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 移除拖拽悬停样式
  dropAreaRef.value?.classList.remove(hoverClass);
};

/**
 * 检查文件是否符合accept限制
 */
const isValidFileType = (fileName: string, acceptTypes: string[]): boolean => {
  const fileNameParts = fileName.split('.');
  // 如果文件名没有扩展名部分，则视为无效文件
  if (fileNameParts.length <= 1) {
    return false;
  }

  const fileExtension = '.' + fileNameParts.pop()?.toLowerCase();
  return acceptTypes.includes(fileExtension);
};

/**
 * 处理文件夹内容
 */
const processDirectoryEntry = (
  entry: any,
  acceptTypes: string[],
  validFiles: File[],
  callback: () => void
) => {
  if (entry.isDirectory) {
    const directoryReader = entry.createReader();
    // let hasValidFilesInDir = false;

    // 递归读取目录内容
    const readEntries = () => {
      directoryReader.readEntries((entries: any[]) => {
        if (entries.length === 0) {
          callback();
          return;
        }

        let pendingEntries = entries.length;

        entries.forEach((subEntry) => {
          if (subEntry.isDirectory) {
            // 递归处理子目录
            processDirectoryEntry(subEntry, acceptTypes, validFiles, () => {
              pendingEntries--;
              if (pendingEntries === 0) {
                readEntries(); // 继续读取下一批
              }
            });
          } else if (subEntry.isFile) {
            // 处理文件
            subEntry.file((file: File) => {
              if (isValidFileType(file.name, acceptTypes)) {
                validFiles.push(file);
                // hasValidFilesInDir = true;
              }

              pendingEntries--;
              if (pendingEntries === 0) {
                readEntries(); // 继续读取下一批
              }
            });
          } else {
            pendingEntries--;
            if (pendingEntries === 0) {
              readEntries(); // 继续读取下一批
            }
          }
        });
      });
    };

    readEntries();
  } else if (entry.isFile) {
    entry.file((file: File) => {
      if (isValidFileType(file.name, acceptTypes)) {
        validFiles.push(file);
      }
      callback();
    });
  } else {
    callback();
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 移除拖拽悬停样式
  dropAreaRef.value?.classList.remove(hoverClass);

  // 获取拖放的文件和目录
  const items = e.dataTransfer?.items;
  const files = e.dataTransfer?.files;
  const acceptTypes = props.accept.split(',');

  // 如果浏览器支持DataTransferItemList接口和webkitGetAsEntry方法（用于处理文件夹）
  // @ts-ignore
  if (items && items.length > 0 && items[0].webkitGetAsEntry) {
    let validFiles: File[] = [];
    let pendingItems = items.length;
    let hasDirectories = false;

    // 处理所有拖放项
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();

      if (entry) {
        if (entry.isDirectory) {
          hasDirectories = true;
          processDirectoryEntry(entry, acceptTypes, validFiles, () => {
            pendingItems--;
            if (pendingItems === 0) {
              // 所有项目处理完成，处理结果
              processValidFiles(validFiles, hasDirectories);
            }
          });
        } else if (entry.isFile) {
          // @ts-ignore
          entry.file((file: File) => {
            if (isValidFileType(file.name, acceptTypes)) {
              validFiles.push(file);
            }

            pendingItems--;
            if (pendingItems === 0) {
              // 所有项目处理完成，处理结果
              processValidFiles(validFiles, hasDirectories);
            }
          });
        } else {
          pendingItems--;
          if (pendingItems === 0) {
            // 所有项目处理完成，处理结果
            processValidFiles(validFiles, hasDirectories);
          }
        }
      } else {
        pendingItems--;
        if (pendingItems === 0) {
          // 所有项目处理完成，处理结果
          processValidFiles(validFiles, hasDirectories);
        }
      }
    }
  } else if (files && files.length > 0) {
    // 浏览器不支持文件夹处理API，使用传统方法
    let hasInvalidFiles = false;
    let validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 检查文件类型是否符合accept属性的限制
      if (isValidFileType(file.name, acceptTypes)) {
        validFiles.push(file);
      } else {
        hasInvalidFiles = true;
      }
    }

    // 如果有无效文件，显示提示
    if (hasInvalidFiles) {
      alert(
        '请注意：不支持的文件类型已被忽略，仅接受' + props.accept + '格式的文件'
      );
    }

    // 处理有效文件
    if (validFiles.length > 0) {
      processValidFiles(validFiles, false);
    }
  }
};

/**
 * 处理有效文件
 */
const processValidFiles = (validFiles: File[], hasDirectories: boolean) => {
  if (validFiles.length === 0) {
    if (hasDirectories) {
      alert('文件夹中没有找到符合' + props.accept + '格式的文件');
    }
    return;
  }

  // 如果有文件夹且找到了有效文件，显示提示
  if (hasDirectories) {
    alert(
      '已从文件夹中提取' +
        validFiles.length +
        '个符合' +
        props.accept +
        '格式的文件'
    );
  }

  // 检查重复文件
  const duplicateFiles: string[] = [];
  const newFiles: File[] = [];
  
  // 检查每个文件是否已存在
  for (const file of validFiles) {
    if (uploadedFiles.value.has(file.name)) {
      duplicateFiles.push(file.name);
    } else {
      newFiles.push(file);
    }
  }
  
  // 如果有重复文件，询问用户是否替换
  if (duplicateFiles.length > 0) {
    // 构建提示消息
    let confirmMessage = '';
    if (duplicateFiles.length === 1) {
      confirmMessage = `文件「${duplicateFiles[0]}」已存在，是否替换？`;
    } else {
      confirmMessage = `发现${duplicateFiles.length}个重复文件：\n${duplicateFiles.join('\n')}\n\n是否替换这些文件？`;
    }
    
    if (confirm(confirmMessage)) {
      // 用户选择替换，将所有文件添加到新文件列表中
      newFiles.push(...validFiles.filter(file => duplicateFiles.includes(file.name)));
    }
    // 如果用户选择不替换，则只添加新文件
  }
  
  // 如果没有新文件要添加，直接返回
  if (newFiles.length === 0) {
    return;
  }

  // 创建包含当前文件和新文件的FileList对象
  const dataTransfer = new DataTransfer();
  
  // 如果是多选模式，先添加现有文件
  if (props.multiple && props.modelValue) {
    // 添加现有文件（除了被替换的文件）
    for (let i = 0; i < props.modelValue.length; i++) {
      const existingFile = props.modelValue[i];
      // 如果文件不在要替换的列表中，则保留
      if (!duplicateFiles.includes(existingFile.name)) {
        dataTransfer.items.add(existingFile);
      }
    }
  }
  
  // 添加新文件
  newFiles.forEach(file => dataTransfer.items.add(file));
  const updatedFiles = dataTransfer.files;
  
  // 如果不支持多选且有多个文件，只保留第一个
  if (!props.multiple && updatedFiles.length > 1) {
    const singleFile = new DataTransfer();
    singleFile.items.add(updatedFiles[0]);
    // 更新文件输入框的值
    if (fileInputRef.value) {
      fileInputRef.value.files = singleFile.files;
    }
    // 触发事件
    emit('change', singleFile.files);
    emit('update:modelValue', singleFile.files);
    
    // 更新已上传文件Map
    uploadedFiles.value.set(updatedFiles[0].name, updatedFiles[0]);
  } else {
    // 更新文件输入框的值
    if (fileInputRef.value) {
      fileInputRef.value.files = updatedFiles;
    }
    // 触发事件
    emit('change', updatedFiles);
    emit('update:modelValue', updatedFiles);
    
    // 更新已上传文件Map
    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      uploadedFiles.value.set(file.name, file);
    }
  }
};

// /**
//  * 读取字体文件内容并解析
//  */
// const readFontFileContent = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     // 对于字体文件，我们可以尝试提取一些基本信息
//     const reader = new FileReader();
    
//     reader.onload = () => {
//       try {
//         // 这里可以添加字体文件解析逻辑
//         // 由于字体文件是二进制的，我们可以返回一些基本信息
//         const fontInfo = `字体文件: ${file.name}\n` +
//                         `大小: ${formatFileSize(file.size)}\n` +
//                         `类型: ${getFileExtension(file.name)}\n` +
//                         `上传时间: ${new Date().toLocaleString()}`;
//         resolve(fontInfo);
//       } catch (error) {
//         reject('无法解析字体文件');
//       }
//     };
    
//     reader.onerror = () => reject('读取文件失败');
    
//     // 读取文件头部数据
//     const blob = file.slice(0, Math.min(file.size, 1024 * 10)); // 读取前10KB
//     reader.readAsArrayBuffer(blob);
//   });
// };

// 为虚线区域添加事件监听
onMounted(() => {
  // 初始化已上传文件Map
  initUploadedFiles();
  
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

<style scoped>
/* 文件列表动画 */
.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.3s ease;
}

.file-list-enter-from {
  /* // 不需要在这里添加文件选择变化事件监听，因为我们在onChange函数中动态创建input时已经添加了 */
  opacity: 0;
  transform: translateY(-30px);
}

.file-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 确保文件项有正确的定位 */
.file-item {
  position: relative;
  transition: all 0.3s ease;
  transform-origin: center;
  will-change: transform, opacity;
}
</style>

<style scoped lang="less"></style>
