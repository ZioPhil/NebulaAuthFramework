<template>
  <PageLayout>
    <ProfilesList :id="role.roleId" :name="role.roleName" />
  </PageLayout>
</template>

<script setup>
import PageLayout from "@/components/page-layout.vue";
import ProfilesList from "@/components/profiles-list.vue";

const role = defineProps({
  roleId: String,
  roleName: String,
});
</script>