<template>
  <div class="roles">
    <h2 class="roles__title">{{ title }}</h2>
    <div class="roles__grid">
      <div v-for="role in roles" :key="role.id" @click="showModal(role)">
        <RoleCard :name="role.name" :id="role.id" />
      </div>
    </div>
  </div>
  <Modal
    v-show="isModalVisible"
    @close="closeModal"
    @machines="machinesRedirect"
    @users="usersRedirect"
  />
</template>

<script setup>
import Modal from "@/components/admin-choice-modal.vue";
import RoleCard from "@/components/role-card.vue";
import { getRoles } from "@/services/machine.service";
import { ref } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";

const roles = ref([]);
const title = ref("");
const isModalVisible = ref(false);
const currRole = ref();
const { getAccessTokenSilently } = useAuth0();
const router = useRouter();

// get all the roles from the server
const getRoleData = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    const { data, error } = await getRoles(token);

    if (data) {
      roles.value = data;
      title.value = "Roles List";
    }

    if (error) {
      console.error(error);
      title.value = "You are not an admin";
    }
  } catch (e) {
    console.error(e);
  }
};

const showModal = async (role) => {
  isModalVisible.value = true;
  currRole.value = role;
};
const closeModal = async () => {
  isModalVisible.value = false;
};

const machinesRedirect = async () => {
  /*
  await router.push({
    name: "setMachines",
    params: { userId: currUser.value.user_id, userName: currUser.value.name },
  });
   */
};
const usersRedirect = async () => {};

getRoleData();
</script>