<script setup lang="ts">
import { BApp } from 'bootstrap-vue-next';
import { RouterView } from 'vue-router';
</script>

<template>
  <BApp>
    <RouterView />
  </BApp>
</template>

<style scoped>
.bg-full {
  background-color: #292929;
  min-height: 100vh;
  min-width: 100vw;
}
</style>
