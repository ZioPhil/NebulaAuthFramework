<template>
  <a class="machine-editor">
    <h3 class="machine-editor__headline">{{ machine.name }}</h3>
    <div class="slider__button">
      <label class="switch">
        <input v-if="roleValue" type="checkbox" checked @click="handleClick" />
        <input v-else type="checkbox" @click="handleClick" />
        <span class="slider round"></span>
      </label>
    </div>
  </a>
</template>

<script setup>
import { updateRoleMachines } from "@/services/machine.service";
import { ref } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
const { getAccessTokenSilently } = useAuth0();
const emit = defineEmits(['error'])

const machine = defineProps({
  id: String,
  name: String,
  isAvailable: Boolean,
  roleId: String
});

const roleValue = ref(machine.isAvailable);

const handleClick = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    // TODO:button unclickable and popup until operation completes
    roleValue.value = !roleValue.value
    const { data, error } = await updateRoleMachines(machine.roleId, machine.id, roleValue.value, token);

    if (data) {

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
