<template>
  <a class="machine-editor">
    <h3 class="machine-editor__headline">{{ props.machineName }}</h3>
    <div class="slider__button">
      <label class="switch">
        <input v-if="status" type="checkbox" checked @click="handleClick" />
        <input v-else type="checkbox" @click="handleClick" />
        <span class="slider round"></span>
      </label>
    </div>
  </a>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  machineName: String,
  machineUsersList: Array,
  userId: String,
});

let status = ref(props.machineUsersList.includes(props.userId));

const handleClick = () => {
  status.value = !status.value;
};

defineExpose({
  status,
});
</script>
