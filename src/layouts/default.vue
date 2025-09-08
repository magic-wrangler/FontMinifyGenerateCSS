<template>
  <div class="layout">
    <Header />
    <RouterView />
    <Footer :exclude="['help']" />
  </div>
</template>
<script setup lang="ts">
</script>

