<template>
  <footer v-if="!excludePage" class="pt-70px pb-110px font-Raleway <md:pt-35px <md:pb-55px">
    <Container>
      <div
        class="flex justify-between items-end <md:flex-col <md:items-start <md:gap-24px <md:flex-col-reverse"
      >
        <div class="grid grid-cols-1 gap-16px">
          <a href="./" class="rounded-8px w-35px h-35px decoration-none">
            <img :src="footer?.logoUrl" class="block p-5px w-35px h-35px" />
          </a>
          <div class="font-Raleway caption1-reg">
            {{ templateVal(footer?.copyright) }}
          </div>
        </div>
        <div class="flex items-start gap-16px <md:flex-col">
          <div
            class="flex flex-col gap-16px w-fit <md:flex-row <md:items-center"
            v-for="(item, idx) in footer?.menu"
            :key="idx"
          >
            <div class="min-w-50px caption1-sem">{{ item.name }}</div>
            <div class="grid grid-cols-1 gap-8px" v-for="(child, cidx) in item.subMenu" :key="cidx">
              <div class="min-w-52px" :text="child.name" @click="handleMenuClick(child)" />
            </div>
          </div>
        </div>
      </div>
      <!-- 版权信息 -->
    </Container>
  </footer>
</template>

<script setup lang="ts">
import { useLayouts } from './use-layouts'

import type { Props } from './layouts.interface'

const props = withDefaults(defineProps<Props>(), {
  exclude: () => [],
})
const { footer, excludePage, templateVal, handleMenuClick } = useLayouts(props)
</script>

<style lang="less" scoped></style>
