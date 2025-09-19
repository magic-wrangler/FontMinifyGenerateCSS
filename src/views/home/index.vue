<template>
  <div v-report.brow="'FontMinifyGenerateCSS.home.brow'">
    <Loading :loading="spinning" mask />
    <!-- 介绍 -->
    <section
      class="relative min-h-screen section-inner overflow-x-hidden flex items-center justify-center"
    >
      <Container>
        <div class="text-center title2-sem text-white pb-16px">
          {{ homeInfo?.title }}
        </div>
        <div>
          <UploadFont
            multiple
            v-model="uploadFiles"
            title="Drag and drop font files here"
            desc="Supports woff, woff2, ttf, otf"
            @change="(e: any) => handleFileChange(e)"
            @delete="handleDelete"
          />
        </div>
        <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label class="flex flex-col min-w-40 flex-1">
            <FontTextArea
              v-model="fontText"
              placeholder="Specify characters to include in the subsetted font"
            />
          </label>
        </div>
        <div class="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px]">
          <FontButton
            :is-check="isBasicCharacters"
            @click="handleCheck(FontButtonType.BasicCharacters)"
            btn-text="Basic Characters"
            v-report.click="'FontMinifyGenerateCSS.home.basicCharacters'"
          />
        </div>
        <div class="flex justify-center pt-12">
          <FontButton
            type="primary"
            btn-text="Start Compression"
            @click="handleGenerate"
          />
        </div>
      </Container>
    </section>

    <!-- 预览 -->
    <section
      class="relative min-h-screen section-inner overflow-x-hidden flex items-center justify-center"
    >
      <Container>
        <div class="flex flex-wrap justify-between gap-3 p-4">
          <p
            class="text-white tracking-light text-[32px] font-bold leading-tight min-w-72"
          >
            Preview and Code Generation
          </p>
        </div>
        <h3
          class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4"
        >
          Font Preview
        </h3>
        <div class="flex flex-shrink-0">
          <div class="flex min-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label class="flex flex-col min-w-40 flex-1">
              <FontTextArea
                v-model="fontPreview"
                placeholder="Please enter compressed text"
              />
            </label>
          </div>
          <div class="px-4 py-3 flex-1" :style="fontPreviewStyle">
            {{ fontPreview }}
          </div>
        </div>
        <div class="flex justify-stretch">
          <div class="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
            <FontButton btn-text="Download Font Zip" @click="handleDownloadFontZip" />
          </div>
        </div>
        <div class="flex flex-wrap gap-4 px-4 py-6">
          <div
            class="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-solid border-[#364963] p-6"
          >
            <p class="text-white text-base font-medium leading-normal">
              Original vs. Compressed
            </p>
            <p
              class="text-white tracking-light text-[32px] font-bold leading-tight truncate"
            >
              Compression Rate: 60%
            </p>
            <p class="text-[#0bda5e] text-base font-medium leading-normal">
              +10%
            </p>
            <div
              class="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3"
            >
              <div
                class="border-[#95aac6] bg-[#253346] border-t-2 w-full"
                style="height: 30%"
              ></div>
              <p
                class="text-[#95aac6] text-[13px] font-bold leading-normal tracking-[0.015em]"
              >
                Original
              </p>
              <div
                class="border-[#95aac6] bg-[#253346] border-t-2 w-full"
                style="height: 50%"
              ></div>
              <p
                class="text-[#95aac6] text-[13px] font-bold leading-normal tracking-[0.015em]"
              >
                Compressed
              </p>
            </div>
          </div>
        </div>
        
      </Container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHome, FontButtonType } from '@/composition/use-home';

const {
  spinning,
  homeInfo,
  fontText,
  isBasicCharacters,
  uploadFiles,
  fontPreview,
  fontPreviewStyle,
  handleCheck,
  handleGenerate,
  handleFileChange,
  handleDownloadFontZip,
  handleDelete,
} = useHome();

watchEffect(() => {
  console.log('## fontText ##', fontText.value);
  console.log('## uploadFiles ##', uploadFiles.value);
});
</script>

<style scoped></style>
