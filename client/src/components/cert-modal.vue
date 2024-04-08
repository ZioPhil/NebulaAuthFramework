<template>
  <div class="modal-backdrop" @click="close">
    <div class="modal-error" @click.stop="">
      <header class="modal-header">
        <textarea :value="modal.cert" class="modal-cert-text" readonly />
      </header>
    </div>
  </div>
</template>

<script setup>
const modal = defineProps({
  cert: String,
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