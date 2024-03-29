<template>
  <div class="nav-bar__tabs">
    <!-- Show the protected and admin tabs on navbar only if the user is authenticated -->
    <template v-if="isAuthenticated">
      <NavBarTab path="/protected" label="Machine Dashboard" />
      <NavBarTab path="/admin" label="Admin Dashboard" />
    </template>
  </div>
</template>

<script setup>
import NavBarTab from "@/components/navigation/desktop/nav-bar-tab.vue";
import { useAuth0 } from "@auth0/auth0-vue";

const { isAuthenticated } = useAuth0();
</script>
