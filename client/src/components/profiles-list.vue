<template>
  <div class="profiles">
    <h2 class="profiles__title">
      Editing users with {{ role.name }} role
    </h2>
    <div class="profiles__grid">
      <div v-for="user in users" :key="user.user_id">
        <ProfileCard
          :id="user.user_id"
          :name="user.name"
          :hasRole="user.hasRole"
          :roleId="role.id"
          ref="cards"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ProfileCard from "@/components/profile-card.vue";
import { getUsers } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
import { ref } from "vue";

const role = defineProps({
  id: String,
  name: String,
});

const users = ref([]);
const cards = ref(null);
const { getAccessTokenSilently } = useAuth0();

//request to the server to get all users
const getUsrs = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    const { data, error } = await getUsers(role.id, token);

    if (data) {
      users.value = data;
    }

    if (error) {
      console.error(error);
    }
  } catch (e) {
    console.error(e);
  }
};

getUsrs();
</script>
