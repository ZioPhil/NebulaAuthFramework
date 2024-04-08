<template>
  <a class="profile">
    <h3 class="profile__headline">{{ user.name }}</h3>
  </a>
</template>

<script setup>
const user = defineProps({
  name: String,
  id: String,
});
</script>
