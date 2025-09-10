<template>
  <div v-report.brow="'FontMinifyGenerateCSS.home.brow'">
    <!-- 介绍 -->
    <section class="relative min-h-screen section-inner overflow-x-hidden">
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
            @change="handleFileChange"
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
          <FontButton
            :is-check="isPunctuation"
            @click="handleCheck(FontButtonType.Punctuation)"
            btn-text="Punctuation"
          />
        </div>
        <h3
          class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4"
        >
          Compression Options
        </h3>
        <div class="flex flex-col flex-wrap">
          <p
            class="text-white text-base font-medium leading-normal pb-2 px-4 py-3 flex items-center gap-2"
          >
            <span>Include unicode-range in CSS</span>
            <!-- 通过在@font-face规则中添加unicode-range属性，浏览器只会下载包含页面上使用的字符的字体文件，从而减小字体文件大小并提高网页加载速度。
              基本拉丁字母（英文）：U+0000-007F
              拉丁文补充：U+0080-00FF
              基本希腊语：U+0370-03FF
              中日韩统一表意文字（常用汉字）：U+4E00-9FFF
              韩文音节：U+AC00-D7AF --> 
            <Tooltip placement="right" color="#253346">
              <template #title>
                <div class="caption1-reg pb-2 font-Space_Grotesk">
                  By adding the unicode-range attribute in the @font-face rule, the browser will only download the font file containing the characters used on the page, thereby reducing the font file size and improving the web page loading speed.
                </div>
                <div class="flex flex-col flex-shrink-0 gap-1 caption1-reg font-Space_Grotesk">
                  <span> <span class="font-bold">Basic Latin letters (English) : </span>U+0000-007F </span>
                  <span> <span class="font-bold">Latin supplement: </span>U+0080-00FF </span>
                  <span> <span class="font-bold">Basic Greek: </span>U+0370-03FF </span>
                  <span> <span class="font-bold">The unified ideographic script (commonly used Chinese characters) for China, Japan and South Korea: </span>U+4E00-9FFF </span>
                  <span> <span class="font-bold">Korean syllable:</span>U+AC00-D7AF </span>
                </div>
              </template>
              <img
                src="https://w1.gtimg.cn/wujicode/fx_drop_config/9b3ec3b6d0b77da38afbb9ef19bf0f0b/360172e3_7Xc7Gms3fAt.svg"
                class="w-5 h-5 cursor-pointer"
              />
            </Tooltip>
          </p>
          <div class="flex flex-wrap gap-3 px-4 py-3">
            <FontButton
              :is-check="isBasicLatin"
              @click="handleCheckUnicodeRange(UnicodeRange.BasicLatin)"
              btn-text="U+0000-007F"
              tips="基本拉丁字母（英文）"
            />
            <FontButton
              :is-check="isLatinSupplement"
              @click="handleCheckUnicodeRange(UnicodeRange.LatinSupplement)"
              btn-text="U+0080-00FF"
              tips="拉丁文补充"
            />
            <FontButton
              :is-check="isGreek"
              @click="handleCheckUnicodeRange(UnicodeRange.Greek)"
              btn-text="U+0370-03FF"
              tips="基本希腊语"
            />
            <FontButton
              :is-check="isCJK"
              @click="handleCheckUnicodeRange(UnicodeRange.CJK)"
              btn-text="U+4E00-9FFF"
              tips="中日韩统一表意文字（常用汉字）"
            />
            <FontButton
              :is-check="isKorean"
              @click="handleCheckUnicodeRange(UnicodeRange.Korean)"
              btn-text="U+AC00-D7AF"
              tips="韩文音节"
            />
          </div>
        </div>
        <div class="flex justify-center py-12">
          <FontButton
            btn-text="Start Compression"
            @click="handleGenerate"
          />
        </div>
        <Loading :loading="spinning" mask />
      </Container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHome, FontButtonType, UnicodeRange } from '@/composition/use-home';
import { Tooltip } from 'ant-design-vue';

const {
  spinning,
  homeInfo,
  fontText,
  isBasicCharacters,
  isPunctuation,
  isBasicLatin,
  isLatinSupplement,
  isGreek,
  isCJK,
  isKorean,
  uploadFiles,
  handleCheck,
  handleCheckUnicodeRange,
  handleGenerate,
} = useHome();

console.log(
  '%c🤪 ~ file: /Users/zl_bofeng/Documents/github/ncform-pro/packages/docs/src/views/home.vue:33 [] -> homeInfo : ',
  'color: #557dc',
  homeInfo
);



watchEffect(() => {
  console.log('## fontText ##', fontText.value);
  console.log('## uploadFiles ##', uploadFiles.value);
});

const handleFileChange = (file: FileList | null) => {
  console.log(
    '%c🤪 ~ file: index.vue:48 [] -> uploadFiles : ',
    'color: #372f1e',
    uploadFiles.value
  );
  console.log(
    '%c🤪 ~ file: index.vue:50 [] -> file : ',
    'color: #1e498b',
    file
  );
};
</script>
<style scoped>

</style>
