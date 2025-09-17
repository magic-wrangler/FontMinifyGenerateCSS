<template>
  <div class="layout">
    <Header />
    <RouterView />
    <Footer v-if="spinning" :exclude="['help']" />
  </div>
</template>
<script setup lang="ts">
import { EmitterEvents, emitter } from '@/mitt';
import { useSpinning } from '@/hooks/use-spinning';

const { spinning, showSpinning, hideSpinning } = useSpinning();

emitter.on(EmitterEvents.DATA_LOADED, (params) => {
  if (params.isloading) {
    showSpinning();
  } else {
    hideSpinning();
  }
});
</script>

