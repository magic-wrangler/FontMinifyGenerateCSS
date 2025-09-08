<template>
  <div>
    <section
      class="relative h-screen section-inner overflow-x-hidden"
    >
      <Container>
        <div class="flex flex-wrap justify-between gap-3 p-4">
          <p
            class="tracking-light text-[32px] font-bold leading-tight min-w-72"
          >
            {{ helpData?.title }}
          </p>
        </div>
        <h2
          class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
        >
          {{ helpData?.gettingStarted?.title }}
        </h2>
        <p
          class="text-white text-base font-normal leading-normal pb-3 pt-1 px-4"
        >
          {{ helpData?.gettingStarted?.desc }}
        </p>
        <h3
          class="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4"
        >
          {{ helpData?.stepByStepGuide.title }}
        </h3>
        <div>
          <div
            class="flex items-center gap-4 bg-[#121921] px-4 min-h-[72px] py-2"
            v-for="(item, index) in helpData?.stepByStepGuide.stepList"
            :key="index"
          >
            <div
              class="flex items-center justify-center rounded-8px bg-primary-normal shrink-0 size-48px"
            >
              <img :src="item.svg" alt="" />
            </div>
            <div class="flex flex-col justify-center">
              <p
                class="text-white text-base font-medium leading-normal line-clamp-1"
              >
                {{ item.title }}
              </p>
              <p
                class="color-text-auxiliary text-sm font-normal leading-normal line-clamp-2"
              >
                {{ item.desc }}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2
            class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"
          >
            {{ helpData?.additionalResources?.title }}
          </h2>
          <p
            class="text-white text-base font-normal leading-normal pb-3 pt-1 px-4"
          >
            {{ helpData?.additionalResources?.desc }}
          </p>
          <div
            class="flex items-center gap-4 px-4 min-h-14"
            hover="cursor-pointer bg-white/10 rounded-lg"
            v-for="(item, index) in helpData?.additionalResources?.stepList"
            :key="index"
          >
            <div
              class="text-white flex items-center justify-center rounded-lg bg-[#273545] shrink-0 size-10"
            >
              <img :src="item.svg" alt="" />
            </div>
            <p
              class="text-white text-base font-normal leading-normal flex-1 truncate"
            >
              {{ item.title }}
            </p>
          </div>
        </div>
      </Container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHelp } from '@/composition/use-help';

const { helpData } = useHelp();
</script>

<style scoped></style>
