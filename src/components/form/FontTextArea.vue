<template>
  <div>
    <textarea
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      class="form-input flex w-full min-w-0 flex-1 resize-vertical overflow-auto rounded-lg text-white
        focus:outline-0 focus:ring-0 border-none bg-[#253346] focus:bg-[#254633] focus:border-none min-h-36
      placeholder:text-[#95a9c6] focus:placeholder:text-[#95c6a9] p-4 text-base font-normal leading-normal transition-all"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
interface FontTextAreaProps {
  modelValue: string;
  placeholder?: string;
}

withDefaults(defineProps<FontTextAreaProps>(), {
  placeholder: '请输入',
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const onInput = (e: any) => {
  emits('update:modelValue', e.target.value);
};
</script>

<style scoped></style>
