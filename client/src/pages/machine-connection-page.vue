<template>
  <PageLayout>
    <MachineConnector :id="machine.machineId" :name="machine.machineName" />
  </PageLayout>
</template>

<script setup>
import PageLayout from "@/components/page-layout.vue";
import MachineConnector from "@/components/machine-connector.vue";

const machine = defineProps({
  machineId: String,
  machineName: String,
});
</script>