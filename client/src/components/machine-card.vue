<template>
  <a class="machine">
    <h3 class="machine__headline">
      {{ machine.name }}
    </h3>
  </a>
</template>

<script setup>
const machine = defineProps({
  name: String,
});
</script>
