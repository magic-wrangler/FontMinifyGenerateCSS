<template>
  <button
    v-bind="$attrs"
    class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#253346] text-white text-sm font-bold leading-normal tracking-[0.015em] border-none"
    hover="bg-[#254633]"
    active="filter-brightness-95"
    :class="{'!bg-[#254633]': isCheck}"
    @click="onClick"
  >
    <span class="truncate"> <slot>{{ btnText }}</slot></span>
  </button>
</template>

<script setup lang="ts">
interface FontButtonProps {
  btnText?: string;
  isCheck?: boolean;
}

withDefaults(defineProps<FontButtonProps>(), {
  btnText:'按钮',
  isCheck: false,
});

const emit = defineEmits(['click']);

const onClick = () => {
  emit('click');
};

</script>

<style scoped></style>
