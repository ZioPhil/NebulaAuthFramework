<template>
  <div class="machines-editor">
    <h2 class="machines-editor__title">
      Editing available machines for {{ user.name }}
      <button class="button__save" @click="handleSave(machines, user.userId)">
        Save changes
      </button>
    </h2>
    <div class="machines-editor__grid">
      <div v-for="machine in machines" :key="machine.id">
        <MachineCard
          :machineName="machine.name"
          :machineUsersList="machine.users"
          :userId="user.userId"
          ref="cards"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import MachineCard from "@/components/machine-editor-card.vue";
import { getMachinesAdmin } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
import { ref } from "vue";

const user = defineProps({
  userId: String,
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
        scope: "read:machines",
      },
    });

    const { data, error } = await getMachinesAdmin(token);

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

<script>
import { updateMachine } from "@/services/machine.service";
export default {
  methods: {
    async handleSave(machines, id) {
      // TODO: tell to the user that the changes have been saved
      for (let i = 0; i < machines.length; i++) {
        if (machines[i].users.includes(id) && !this.$refs.cards[i].status) {
          machines[i].users.splice(machines[i].users.indexOf(id), 1);
          await this.updateMachine(machines[i]);
        } else if (!machines[i].users.includes(id) && this.$refs.cards[i].status) {
          machines[i].users.push(id);
          await this.updateMachine(machines[i]);
        }
      }
    },

    async updateMachine(machine) {
      try {
        const token = await this.$auth0.getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "manage:users",
          },
        });

        const { data, error } = await updateMachine(machine, token);

        if (data === true) {
          console.log();
        }

        if (error) {
          console.error(error);
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>
