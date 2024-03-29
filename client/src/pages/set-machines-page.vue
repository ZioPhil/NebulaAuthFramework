<template>
  <PageLayout>
    <MachineEditor :userId="user.userId" :name="user.userName" />
  </PageLayout>
</template>

<script setup>
import PageLayout from "@/components/page-layout.vue";
import MachineEditor from "@/components/machine-editor.vue";

const user = defineProps({
  userId: String,
  userName: String,
});
</script>
