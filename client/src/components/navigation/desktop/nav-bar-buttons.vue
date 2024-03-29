<template>
  <div class="nav-bar__buttons">
    <!-- If the user is not authenticated, show signup and login buttons -->
    <template v-if="!isAuthenticated">
      <SignupButton />
      <LoginButton />
    </template>
    <!-- If the user is authenticated, show logout button -->
    <template v-if="isAuthenticated">
      <LogoutButton />
    </template>
  </div>
</template>

<script setup>
import LoginButton from "@/components/buttons/login-button.vue";
import LogoutButton from "@/components/buttons/logout-button.vue";
import SignupButton from "@/components/buttons/signup-button.vue";
import { useAuth0 } from "@auth0/auth0-vue";

const { isAuthenticated } = useAuth0();
</script>
