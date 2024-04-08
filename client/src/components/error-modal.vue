<template>
  <div class="modal-backdrop" @click="close">
    <div class="modal-error" @click.stop="">
      <header class="modal-header">
        <slot name="header"> {{ modal.error }} </slot>
      </header>
    </div>
  </div>
</template>

<script setup>
const modal = defineProps({
  error: String,
});
</script>

<script>
export default {
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>