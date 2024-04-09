<template>
  <div class="modal-backdrop" @click="close">
    <div class="modal" @click.stop="">
      <header class="modal-header">
        <slot name="header"> Choose what to modify </slot>
      </header>

      <footer class="modal-footer">
        <button type="button" class="button__choice" @click="machines">
          Machines
        </button>
        <button type="button" class="button__choice" @click="users">
          Users
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "admin-choice-modal",
  methods: {
    machines() {
      this.$emit("machines");
    },
    users() {
      this.$emit("users");
    },
    close() {
      this.$emit("close");
    },
  },
};
// TODO: Change header in "choose what to modify for {role}"
</script>
