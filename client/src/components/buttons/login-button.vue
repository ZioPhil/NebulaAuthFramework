<template>
  <button class="button__login" @click="handleLogin">Log In</button>
</template>

<script setup>
import { useAuth0 } from "@auth0/auth0-vue";

const { loginWithRedirect } = useAuth0();

const handleLogin = () => {
  loginWithRedirect({
    appState: {
      target: "/protected", // after the user logs in and is redirected to the callback page, take it to the machines page
    },
  });
};
</script>
