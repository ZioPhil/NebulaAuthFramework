<template>
  <router-link
    :to="{
      name: 'setMachines',
      params: { userId: user.id, userName: user.name },
    }"
    class="profile"
  >
    <h3 class="profile__headline">{{ user.name }}</h3>
    <div class="slider__button">
      <label class="switch">
        <input type="checkbox" />
        <span class="slider round"></span>
      </label>
    </div>
  </router-link>
</template>

<script setup>
const user = defineProps({
  name: String,
  id: String,
});
</script>
