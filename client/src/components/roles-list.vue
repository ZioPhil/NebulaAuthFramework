<template>
  <div class="roles">
    <div class="roles__titlebar-grid">
      <div class="roles__titlebar-container">
        <h2 class="roles__title">{{ title }}</h2>
        <button v-if="isAdmin" class="button__add-role" @click="handleCreate()">
          + Create Role
        </button>
      </div>
      <div class="exploration-bar" v-if="roles.length !== 0">
        <div class="pagination" :key="pagCounter">
          <a @click="counterDown()">&laquo;</a>
          <a class="central">{{pagCounter+1}}-{{roles.length + pagCounter}}</a>
          <a @click="counterUp()">&raquo;</a>
        </div>
        <div class="search-container">
          <input type="text" :placeholder="searchBoxPlaceholder" name="search" v-model="searchBox">
          <button @click="handleSearch()">Submit</button>
        </div>
      </div>
    </div>
    <div class="roles__grid" :key="roles">
      <div v-for="role in roles" :key="role.ID" @click="showModal(role)">
        <RoleCard
          :name="role.Name"
          :id="role.ID"
          @reload="reload"
          @error="errorHandling"
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
    @error="errorHandling"
  />
  <ErrorModal
    ref="error_modal"
    v-show="isErrorModalVisible"
    @close="closeErrorModal"
    :error="error"
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
import ErrorModal from "@/components/modals/error-modal.vue";

const roles = ref([]);
const title = ref("");
const pagCounter = ref(0);
const isModalVisible = ref(false);
const isCreateRoleModalVisible = ref(false);
const isAdmin = ref(false);
const isErrorModalVisible = ref(false);
const error = ref("unknown");
const searchBox = ref();
const currentSearchValue = ref("")
const searchBoxPlaceholder = ref("Search..")
const currRole = ref();
const { getAccessTokenSilently } = useAuth0();
const router = useRouter();

// get all the roles from the server
const getRoleData = async (up) => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    let customPagCounter = pagCounter.value
    if (up) customPagCounter += 50

    const { data, error } = await getRoles(customPagCounter, currentSearchValue.value, token);

    if (data) {
      roles.value = data;
      title.value = "Roles List";
      isAdmin.value = true;
      return true
    }

    if (error) {
      if (error.message === "Insufficient scope") {
        await showErrorModal("You are not an admin")
      }
      else if (error.message === "No more roles") {
        return false
      }
      else if (error.message === "No roles with that name") {
        await showErrorModal(error.message)
        return false
      }
      else {
        await showErrorModal(error.message)
      }
    }
  } catch (e) {
    await showErrorModal(e.message)
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
  await router.push({
    name: "setMachines",
    params: { roleId: currRole.value.ID, roleName: currRole.value.Name },
  });
};
const usersRedirect = async () => {
  await router.push({
    name: "setUsers",
    params: { roleId: currRole.value.ID, roleName: currRole.value.Name },
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
  await getRoleData(false)
  if (isCreateRoleModalVisible) {
    await closeCreateRoleModal()
  }
}

const errorHandling = async (error) => {
  if (isCreateRoleModalVisible) {
    await closeCreateRoleModal()
  }
  await showErrorModal(error.message)
}

const counterDown = async () => {
  if (pagCounter.value !== 0) {
    pagCounter.value -= 50
    await getRoleData(false);
  }
}

const counterUp = async () => {
  if (roles.value.length === 50) {
    if (await getRoleData(true)) {
      pagCounter.value += 50;
    }
  }
}

const showErrorModal = async (err) => {
  error.value = err
  isErrorModalVisible.value = true;
}

const closeErrorModal = async () => {
  isErrorModalVisible.value = false;
}

const handleSearch = async () => {
  const oldSearchValue = currentSearchValue.value
  const oldPagCounter = pagCounter.value
  currentSearchValue.value = searchBox.value
  pagCounter.value = 0
  searchBox.value = ""
  if (!await getRoleData(false)) {
    currentSearchValue.value = oldSearchValue
    pagCounter.value = oldPagCounter
  }
  else {
    if (currentSearchValue.value === "") {
      searchBoxPlaceholder.value = "Search.."
    }
    else {
      // TODO: make it more clear that you have to press button again to cancel search
      searchBoxPlaceholder.value = "Current search: " + currentSearchValue.value
    }
  }
}

getRoleData(false);
</script>