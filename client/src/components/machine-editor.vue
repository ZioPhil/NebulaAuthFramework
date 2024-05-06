<template>
  <div class="machines-editor">
    <div class="machines-editor__titlebar-grid">
      <h2 class="machines-editor__title">
        Editing machines for {{ role.name }} role
      </h2>
      <div class="exploration-bar" v-if="machines.length !== 0">
        <div class="pagination" :key="pagCounter">
          <a @click="counterDown()">&laquo;</a>
          <a class="central">{{pagCounter+1}}-{{machines.length + pagCounter}}</a>
          <a @click="counterUp()">&raquo;</a>
        </div>
        <div class="search-container">
          <input type="text" :placeholder="searchBoxPlaceholder" name="search" v-model="searchBox">
          <button @click="handleSearch()">Submit</button>
        </div>
      </div>
    </div>
    <div class="machines-editor__grid" :key="machines">
      <div v-for="machine in machines" :key="machine.ID">
        <MachineCard
          :id="machine.ID"
          :name="machine.Name"
          :isAvailable="machine.isAvailable"
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
import MachineCard from "@/components/machine-editor-card.vue"
import { getMachinesAdmin } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
import { ref } from "vue";
import ErrorModal from "@/components/modals/error-modal.vue";

const role = defineProps({
  id: String,
  name: String,
});

const machines = ref([]);
const cards = ref(null);
const pagCounter = ref(0);
const isErrorModalVisible = ref(false);
const error = ref("unknown");
const searchBox = ref();
const currentSearchValue = ref("")
const searchBoxPlaceholder = ref("Search..")
const { getAccessTokenSilently } = useAuth0();

//request to the server to get all machines
const getMachs = async (up) => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    let customPagCounter = pagCounter.value
    if (up) customPagCounter += 50

    const { data, error } = await getMachinesAdmin(role.id, customPagCounter, currentSearchValue.value, token);

    if (data) {
      machines.value = data;
      return true
    }

    if (error) {
      if (error.message === "Insufficient scope") {
        await showErrorModal("You are not an admin")
      }
      else if (error.message === "No more machines") {
        return false
      }
      else if (error.message === "No machines with that name") {
        await showErrorModal(error.message)
        return false
      }
      else await showErrorModal(error.message)
    }
  } catch (e) {
    await showErrorModal(e.message)
  }
};

const showErrorModal = async (err) => {
  error.value = err
  isErrorModalVisible.value = true;
}

const closeErrorModal = async () => {
  isErrorModalVisible.value = false;
}

const counterDown = async () => {
  if (pagCounter.value !== 0) {
    pagCounter.value -= 50;
    await getMachs(false);
  }
}

const counterUp = async () => {
  if (machines.value.length === 50) {
    if (await getMachs(true)) {
      pagCounter.value += 50;
    }
  }
}

const errorHandling = async (error) => {
  await showErrorModal(error.message)
}

const handleSearch = async () => {
  const oldSearchValue = currentSearchValue.value
  const oldPagCounter = pagCounter.value
  currentSearchValue.value = searchBox.value
  pagCounter.value = 0
  searchBox.value = ""
  if (!await getMachs(false)) {
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

getMachs(false);
</script>
