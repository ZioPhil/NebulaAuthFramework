<template>
  <div class="roles">
    <div class="roles__titlebar-grid">
      <div class="roles__titlebar-container">
        <h2 class="roles__title">{{ title }}</h2>
        <button class="button__add-role" @click="handleCreate()">
          + Create Role
        </button>
      </div>
    </div>
    <div class="roles__grid" :key="roles">
      <div v-for="role in roles" :key="role.id" @click="showModal(role)">
        <RoleCard
          :name="role.name"
          :id="role.id"
          @reload="reload"
        />
      </div>
    </div>
  </div>
  <Modal
    v-show="isModalVisible"
    @close="closeModal"
    @machines="machinesRedirect"
    @users="usersRedirect"
  />
  <CreateRoleModal
    v-show="isCreateRoleModalVisible"
    @close="closeCreateRoleModal"
    @reload="reload"
  />
</template>

<script setup>
import Modal from "@/components/modals/admin-choice-modal.vue";
import CreateRoleModal from "@/components/modals/create-role-modal.vue";
import RoleCard from "@/components/role-card.vue";
import { getRoles } from "@/services/machine.service";
import { ref } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";

const roles = ref([]);
const title = ref("");
const isModalVisible = ref(false);
const isCreateRoleModalVisible = ref(false);
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

};
const usersRedirect = async () => {
  await router.push({
    name: "setUsers",
    params: { roleId: currRole.value.id, roleName: currRole.value.name },
  });
};

const handleCreate = async () => {
  isCreateRoleModalVisible.value = true;
}

const closeCreateRoleModal = async () => {
  isCreateRoleModalVisible.value = false;
};

const reload = async () => {
  // TODO: block page until create or delete operation completes
  await getRoleData()
  if (isCreateRoleModalVisible) {
    await closeCreateRoleModal()
  }
}

getRoleData();
</script>