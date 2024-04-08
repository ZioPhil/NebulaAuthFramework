<template>
  <a class="role">
    <h3 class="role__headline">{{ role.name }}</h3>
  </a>
</template>

<script setup>
const role = defineProps({
  name: String,
  id: String,
});
</script>