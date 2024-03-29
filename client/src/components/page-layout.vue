<template>
  <div class="page-layout">
    <NavBar />
    <div class="page-layout__content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import NavBar from "@/components/navigation/desktop/nav-bar.vue";
</script>
