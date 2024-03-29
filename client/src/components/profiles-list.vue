<template>
  <div class="profiles">
    <h2 class="profiles__title">{{ title }}</h2>
    <div class="profiles__grid">
      <div
        v-for="user in users"
        :key="user.user_id"
      >
        <ProfileCard :name="user.name" :id="user.user_id" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ProfileCard from "@/components/profile-card.vue";
import { getUsers } from "@/services/machine.service";
import { ref } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";

const users = ref([]);
const title = ref("");
const { getAccessTokenSilently } = useAuth0();

// get all the users from the server
const getUserData = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "manage:users",
      },
    });

    const { data, error } = await getUsers(token);

    if (data) {
      users.value = data;
      title.value = "Users List";
    }

    if (error) {
      console.error(error);
      title.value = "You are not an admin";
    }
  } catch (e) {
    console.error(e);
  }
};

getUserData();
</script>
