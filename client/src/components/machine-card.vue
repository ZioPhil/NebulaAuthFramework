<template>
  <router-link
    :to="{
      name: 'connectToMachine',
      params: { machineName: machine.name },
    }"
    class="machine"
  >
    <h3 class="machine__headline">
      {{ machine.name }}
    </h3>
  </router-link>
</template>

<script setup>
const machine = defineProps({
  name: String,
});
</script>
