<template>
  <div class="modal-backdrop" @click="close">
    <div class="modal-create-role" @click.stop="">
      <header class="modal-header">
        <input type="text" ref="roleNameText" placeholder="Insert new role name" class="modal-create-role-text" />
      </header>
      <footer class="modal-create-role-footer">
        <button type="button" class="button__create-role-modal" @click="create">
          Create
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { createRole } from "@/services/machine.service";
export default {
  methods: {
    async create() {
      if (!this.$refs.roleNameText.value) {
        this.$refs.roleNameText.placeholder = "Insert a valid role name!"
      } else {
        try {
          const token = await this.$auth0.getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: "manage:users",
            },
          });

          const { data, error } = await createRole(this.$refs.roleNameText.value, token);

          if (data === true) {
            this.$refs.roleNameText.value = ""
            this.$emit("reload");
          }
          else {
            console.log("Error while creating role on server")
          }

          if (error) {
            console.error(error);
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>