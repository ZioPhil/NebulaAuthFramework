<template>
  <PageLayout>
    <ErrorModal
      ref="error_modal"
      v-show="isErrorModalVisible"
      @close="closeErrorModal"
      :error="error"
    />
  </PageLayout>
</template>

<script setup>
import PageLayout from "@/components/page-layout.vue";
import { addUser } from "@/services/machine.service";
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";
import ErrorModal from "@/components/modals/error-modal.vue";
import { ref } from "vue";
const { getAccessTokenSilently, user } = useAuth0();
const router = useRouter();

const isErrorModalVisible = ref(false);
const error = ref("unknown");

const addUsr = async () => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:machines",
      },
    });

    const { data, error } = await addUser(user.value.email, token);

    if (data) {
      await router.push({
        name: "protected",
      });
    }

    if (error) {
      await showErrorModal(error.message)
    }
  } catch (e) {
    await showErrorModal(e.message)
  }
};

const showErrorModal = async (err) => {
  error.value = err
  isErrorModalVisible.value = true;
}

const closeErrorModal = async () => {
  isErrorModalVisible.value = false;
}

addUsr();
</script>