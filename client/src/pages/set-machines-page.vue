<template>
  <PageLayout>
    <MachineEditor :id="role.roleId" :name="role.roleName" />
  </PageLayout>
</template>

<script setup>
import PageLayout from "@/components/page-layout.vue";
import MachineEditor from "@/components/machine-editor.vue";

const role = defineProps({
  roleId: String,
  roleName: String,
});
</script>
