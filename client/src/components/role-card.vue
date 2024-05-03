<template>
  <a class="role">
    <h3 class="role__headline">{{ role.name }}</h3>
    <button class="button__delete-role" @click.stop="" @click="deleteR">
      Delete
    </button>
  </a>
</template>

<script setup>
import { deleteRole } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
const { getAccessTokenSilently } = useAuth0();
const emit = defineEmits(['reload', 'error'])

const role = defineProps({
  name: String,
  id: String,
});

const deleteR = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    // TODO: are you sure you want to delete role? modal
    const { data, error } = await deleteRole(role.id, token);

    if (data) {
      emit('reload');
    }

    if (error) {
      if (error.message === "Insufficient scope") {
        emit('error', 'You are not an admin')
      }
      else emit('error', error)
    }
  } catch (e) {
    emit('error', e)
  }
};
</script>