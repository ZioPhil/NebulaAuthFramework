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
const emit = defineEmits(['reload'])

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

    const { data, error } = await deleteRole(role.id, token);

    if (data === true) {
      emit('reload');
    }
    else {
      console.log("Error while deleting role on server")
    }

    if (error) {
      console.error(error);
    }
  } catch (e) {
    console.error(e);
  }
};
</script>