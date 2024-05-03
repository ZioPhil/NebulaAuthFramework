<template>
  <a class="profile">
    <h3 class="profile__headline">{{ user.name }}</h3>
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

import { updateRoleUsers } from "@/services/machine.service";
import { ref } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
const { getAccessTokenSilently } = useAuth0();

const user = defineProps({
  id: String,
  name: String,
  hasRole: Boolean,
  roleId: String
});

const roleValue = ref(user.hasRole);

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
    const { data, error } = await updateRoleUsers(user.roleId, user.id, roleValue.value, token);

    if (data === true) {

    }
    else {
      console.log("Error in role update")
    }

    if (error) {
      console.error(error);
    }
  } catch (e) {
    console.error(e);
  }
};

</script>
