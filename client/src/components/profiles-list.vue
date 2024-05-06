<template>
  <div class="profiles">
    <div class="profiles__titlebar-grid">
      <h2 class="profiles__title">
        Editing users with {{ role.name }} role
      </h2>
      <div class="exploration-bar" v-if="users.length !== 0">
        <div class="pagination" :key="pagCounter">
          <a @click="counterDown()">&laquo;</a>
          <a class="central">{{pagCounter+1}}-{{users.length + pagCounter}}</a>
          <a @click="counterUp()">&raquo;</a>
        </div>
        <div class="search-container">
          <input type="text" placeholder="Search.." name="search" v-model="searchBox">
          <button @click="handleSearch()">Submit</button>
        </div>
      </div>
    </div>
    <div class="profiles__grid" :key="users">
      <div v-for="user in users" :key="user.ID">
        <ProfileCard
          :id="user.ID"
          :name="user.Email"
          :hasRole="user.hasRole"
          :roleId="role.id"
          ref="cards"
          @error="errorHandling"
        />
      </div>
    </div>
  </div>
  <ErrorModal
    ref="error_modal"
    v-show="isErrorModalVisible"
    @close="closeErrorModal"
    :error="error"
  />
</template>

<script setup>
import ProfileCard from "@/components/profile-card.vue";
import ErrorModal from "@/components/modals/error-modal.vue";
import { getUsers } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
import { ref } from "vue";

const role = defineProps({
  id: String,
  name: String,
});

const users = ref([]);
const cards = ref(null);
const pagCounter = ref(0);
const isErrorModalVisible = ref(false);
const error = ref("unknown");
const searchBox = ref();
const currentSearchValue = ref("")
const { getAccessTokenSilently } = useAuth0();

//request to the server to get all users
const getUsrs = async (up) => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    let customPagCounter = pagCounter.value
    if (up) customPagCounter += 50

    const { data, error } = await getUsers(role.id, customPagCounter, currentSearchValue.value, token);

    if (data) {
      users.value = data;
      return true
    }

    if (error) {
      if (error.message === "Insufficient scope") {
        await showErrorModal("You are not an admin")
      }
      else if (error.message === "No more users") {
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

const counterDown = async () => {
  if (pagCounter.value !== 0) {
    pagCounter.value -= 50;
    await getUsrs(false);
  }
}

const counterUp = async () => {
  if (users.value.length === 50) {
    if (await getUsrs(true)) {
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

const errorHandling = async (error) => {
  await showErrorModal(error.message)
}

const handleSearch = async () => {
  currentSearchValue.value = searchBox.value
  pagCounter.value = 0
  await getUsrs(false)
}

getUsrs(false);
</script>
