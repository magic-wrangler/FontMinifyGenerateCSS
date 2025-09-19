<template>
  <header
    ref="headerRef"
    class="flex overflow-auto fixed top-0 left-0 justify-center items-center w-full transition-all duration-300 z-99 header"
    :class="{
      'header--hidden': !showHeader,
      'header--blur': !disableBlur,
    }"
  >
    <Container class="header--nav">
      <nav
        class="flex justify-between items-center gap-32px py-20px rounded-lt-8px rounded-rb-8px"
        :class="{ '!hidden': excludePage }"
      >
        <!-- logo -->
        <a href="./" class="flex items-center gap-8px text-white rounded-8px w-35px h-35px decoration-none">
          <img class="block w-full h-full" :src="header?.logoUrl" />
          <h2 class="text-white text4-sem m-auto mt-0px">{{ SITE_NAME }}</h2>
        </a>
        <div class="flex items-center gap-32px">
          <!-- 菜单 -->
          <div class="flex flex-nowrap items-center gap-20px min-h-fit text-white text-sm font-medium leading-normal">
            <span
              class="cursor-pointer"
              v-for="item in header?.menu"
              :key="item.url"
              @click="handleMenuClick(item)"
            >
              {{ item.name }}
            </span>
          </div>
          <!-- 多语言 -->
        </div>
      </nav>
    </Container>
  </header>
</template>

<script setup lang="ts">
import { SITE_NAME } from '@/constant/app'
import { onMounted, onUnmounted, ref } from 'vue'
import { useLayouts } from './use-layouts'
import type { Props } from './layouts.interface'

const props = withDefaults(defineProps<Props>(), {
  exclude: () => [],
})

const { header, excludePage, handleMenuClick } = useLayouts(props)
// 导航栏组件Ref
const headerRef = ref<HTMLElement | null>(null)
// 顶部距离
const lastScrollTop = ref(0)
// 显示header
const showHeader = ref(true)
const scrollUp = ref(true)
// 是否禁用模糊
const disableBlur = ref(false)

const handleScroll = () => {
  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  const headerHeight = headerRef.value?.offsetHeight || 0
  if (scrollTop < 60) {
    showHeader.value = true
    scrollUp.value = false
  } else if (scrollTop > lastScrollTop.value && scrollTop > headerHeight) {
    // 向下滚动且超过header高度
    showHeader.value = false
    scrollUp.value = false
  } else {
    // 向上滚动
    showHeader.value = true
    scrollUp.value = true
  }
  lastScrollTop.value = scrollTop <= 0 ? 0 : scrollTop
}

// const pathI18n = computed(() => {
//   const index = locales.value.findIndex((item: any) => item.code === locale.value);
//   return locales.value[(index + 1) % locales.value.length];
// });

// const onChangLang = (link: LocaleObject) => {
//   // $biReport(LinkType[link?.label as keyof typeof LinkType]);
//   /** 后续不需要 先放在页脚 */
//   if (['zh-cn', 'en'].includes(link.code)) {
//     const { code } = pathI18n.value as any;
//     const path = switchLocalePath(code);
//     router.push(path);
//   }
// };

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="less" scoped>
.header {
  &--hidden {
    transform: translateY(-100%);
  }
  &--blur {
  }
  &--nav {
    background-color: #121820;
    // background-image: radial-gradient(
    //   transparent 1px,
    //   var(--token-header-nav-bg-color, #ffffff) 1px
    // );
    // background-size: 4px 4px;
    // backdrop-filter: blur(3px);
    // mask: linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);
    opacity: 1;
  }
}
</style>
