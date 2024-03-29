<template>
  <div class="hero-banner hero-banner--yellow-mandarine">
    <div class="hero-banner__logo">
      <img class="hero-banner__image" :src="logo" alt="Vue 3 logo" />
    </div>
    <h1 id="page-title" class="hero-banner__headline">
      Scalable and Reliable Services - Nebula
    </h1>
    <p id="page-description" class="hero-banner__description">
      <span> <strong>Buttazzo Filippo, Volpi Matteo</strong> </span>
      <span> Log in or Sign up to use the service</span>
    </p>
  </div>
</template>

<script setup>
const logo = "https://cdn.auth0.com/blog/developer-hub/vue-logo.svg";
</script>
