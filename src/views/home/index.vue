<template>
  <div>
    <!-- 介绍 -->
    <section
      class="relative h-screen section-inner overflow-x-hidden"
    >
      <Container class="h-full">
        <!-- <div class="grid grid-cols-1 gap-24px w-620px <md:w-full">
          <div class="text-42px leading-54px font-600 color-text-docsPrimary">
            {{ homeInfo?.main?.title }}
          </div>
          <div v-html="homeInfo?.main.desc" class="text5-reg color-text-docsTitle" />
          <div class="flex gap-12px">
            <DefineButton
              v-for="item in homeInfo?.main?.btnList"
              :key="item?.text"
              :icon="item?.icon"
              :type="item?.type === 'jump' ? 'primary' : 'default'"
              :text="item?.text"
            />
          </div>
        </div> -->
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

const uploadFiles = ref<FileList | null>(null);

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
