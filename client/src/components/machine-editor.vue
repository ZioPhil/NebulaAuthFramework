<template>
  <div class="machines-editor">
    <h2 class="machines-editor__title">
      Editing machines for {{ role.name }} role
    </h2>
    <div class="machines-editor__grid">
      <div v-for="machine in machines" :key="machine.id">
        <MachineCard
          :id="machine.id"
          :name="machine.name"
          :isAvailable="machine.isAvailable"
          :roleId="role.id"
          ref="cards"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import MachineCard from "@/components/machine-editor-card.vue"
import { getMachinesAdmin } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
import { ref } from "vue";

const role = defineProps({
  id: String,
  name: String,
});

const machines = ref([]);
const cards = ref(null);
const { getAccessTokenSilently } = useAuth0();

//request to the server to get all machines
const getMachs = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    const { data, error } = await getMachinesAdmin(role.id, token);

    if (data) {
      machines.value = data;
    }

    if (error) {
      console.error(error);
    }
  } catch (e) {
    console.error(e);
  }
};

getMachs();
</script>
