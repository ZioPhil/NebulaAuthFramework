<template>
  <div class="machines">
    <h2 class="machines__title">Machines List</h2>
    <div class="machines__grid">
      <div
        v-for="machine in machines"
        :key="machine.id"
      >
        <MachineCard :name="machine.name" />
      </div>
    </div>
  </div>
</template>

<script setup>
import MachineCard from "@/components/machine-card.vue";
import { getMachinesNormal } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
import { ref } from "vue";

const machines = ref([]);
const { getAccessTokenSilently } = useAuth0();

// get all the machines available to the user from the server
const getMachs = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:machines",
      },
    });

    const { data, error } = await getMachinesNormal(token);

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
