<template>
  <div>
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
        <div class="flex flex-col flex-wrap ">
          <p class="text-white text-base font-medium leading-normal pb-2 px-4 py-3">
            Include unicode-range in CSS
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
      </Container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHome } from '@/composition/use-home';
const { homeInfo } = useHome();
console.log(
  '%c🤪 ~ file: /Users/zl_bofeng/Documents/github/ncform-pro/packages/docs/src/views/home.vue:33 [] -> homeInfo : ',
  'color: #557dc',
  homeInfo
);

enum FontButtonType {
  BasicCharacters = 'BasicCharacters',
  Punctuation = 'Punctuation',
}

enum UnicodeRange {
  BasicLatin = 'U+0000-007F',
  LatinSupplement = 'U+0080-00FF',
  Greek = 'U+0370-03FF',
  CJK = 'U+4E00-9FFF',
  Korean = 'U+AC00-D7AF',
}

const uploadFiles = ref<FileList | null>(null);

const fontText = ref();

const fontButtonType = ref<FontButtonType[]>([]);

const isBasicCharacters = computed(() => {
  return fontButtonType.value.includes(FontButtonType.BasicCharacters);
});

const isPunctuation = computed(() => {
  return fontButtonType.value.includes(FontButtonType.Punctuation);
});

const handleCheck = (type: FontButtonType) => {
  if (fontButtonType.value.includes(type)) {
    fontButtonType.value = fontButtonType.value.filter((item) => item !== type);
  } else {
    fontButtonType.value.push(type);
  }
};

const unicodeRange = ref<UnicodeRange[]>([]);

const isBasicLatin = computed(() => {
  return unicodeRange.value.includes(UnicodeRange.BasicLatin);
});

const isLatinSupplement = computed(() => {
  return unicodeRange.value.includes(UnicodeRange.LatinSupplement);
});

const isGreek = computed(() => {
  return unicodeRange.value.includes(UnicodeRange.Greek);
});

const isCJK = computed(() => {
  return unicodeRange.value.includes(UnicodeRange.CJK);
});

const isKorean = computed(() => {
  return unicodeRange.value.includes(UnicodeRange.Korean);
});

const handleCheckUnicodeRange = (type: UnicodeRange) => {
  if (unicodeRange.value.includes(type)) {
    unicodeRange.value = unicodeRange.value.filter((item) => item !== type);
  } else {
    unicodeRange.value.push(type);
  }
};

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
/* .aaa {
  background: radial-gradient(50% 53% at 50% 100%, #171717, #ababab00);
  bottom: 0;
  flex: none;
  height: 307px;
  left: calc(50.00000000000002% - min(1800px, 100%) / 2);
  max-width: 1800px;
  overflow: hidden;
  position: absolute;
  width: 100%;
  z-index: 3;
}
.bbb {
  background: radial-gradient(50% 53% at 50% 100%, #171717, #ababab00);
  bottom: 0;
  flex: none;
  height: 722px;
  left: calc(50.00000000000002% - min(1800px, 100%) / 2);
  max-width: 1800px;
  overflow: hidden;
  position: absolute;
  width: 100%;
  z-index: 3;
} */
</style>
<!-- 暂时这样进行修改样式 -->
<style>
.ant-image-preview-mask {
  backdrop-filter: blur(5px);
}
</style>
