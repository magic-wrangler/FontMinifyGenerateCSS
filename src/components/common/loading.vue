<template>
  <TransitionGroup>
    <Teleport v-if="loading" to="body">
      <div v-if="mask" class="fixed bg-black/64 h-screen w-screen top-0 z-999999" />
      <div
        class="z-9999999 top-50% left-50% fixed flex flex-col flex-shrink-0 justify-center items-center gap-8px bg-primary-normal backdrop-blur-5px rounded-12px w-120px h-120px translate-x--50% translate-y--50%"
      >
        <img :src="loadindIcon" class="block w-48px h-48px select-none loading-icon" />
        <div class="text-white text5-sem">{{ desc }}</div>
      </div>
    </Teleport>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { Loading } from '@/constant/enums'
import type { LoadingProps } from '../type/loading.type'

const props = withDefaults(defineProps<LoadingProps>(), {
  loadindIcon: Loading.WHITE,
  desc: 'Loading...',
  loading: false,
  mask: false,
})

// 禁止滚动的函数
function disableScroll() {
  document.body.style.overflow = 'hidden'
}

// 恢复滚动的函数
function enableScroll() {
  document.body.style.overflow = ''
}

// 监听 loading 状态变化
watch(
  () => props.loading,
  (newVal) => {
    if (newVal) {
      disableScroll()
    } else {
      enableScroll()
    }
  },
)

onMounted(() => {
  if (props.loading) {
    disableScroll()
  }
})

onUnmounted(() => {
  enableScroll()
})
</script>

<style lang="less" scoped>
.loading-icon {
  animation: loadingAnimation 1.2s linear infinite;
}

@keyframes loadingAnimation {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
