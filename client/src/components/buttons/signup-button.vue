<template>
  <button class="button__sign-up" @click="handleSignUp">Sign Up</button>
</template>

<script setup>
import { useAuth0 } from "@auth0/auth0-vue";

const { loginWithRedirect } = useAuth0();

const handleSignUp = () => {
  loginWithRedirect({
    appState: {
      target: "/protected", // after the user signs up and is redirected to the callback page, take it to the machines page
    },
    authorizationParams: {
      screen_hint: "signup",
    },
  });
};
</script>
