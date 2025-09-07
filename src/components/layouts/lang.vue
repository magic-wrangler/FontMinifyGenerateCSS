<template>
  <div class="flex items-center cursor-pointer text6-sem" @click="onChangLang">
    <span :class="{ 'text-color-primary-normal': isCn }">简</span>
    <span class="bg-black/64 mx-12px w-1px h-14px" />
    <span :class="{ 'text-color-primary-normal': !isCn }">EN</span>
  </div>
</template>

<script setup lang="ts">
import { useLayouts } from './use-layouts'
const { isCn } = useLayouts()
const onChangLang = () => {
  console.log('lang', isCn.value)
}
</script>

<style scoped></style>
