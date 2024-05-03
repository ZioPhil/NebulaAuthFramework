<template>
  <div class="machines-connector">
    <h2 class="machines-connector__title">
      Request certificate for {{ machine.name }}
    </h2>
    <div class="machines-connector__grid">
      <div class="machines-connector__file-selector">
        <input type="file" ref="file" accept=".pub" @change="selectedFile" style="display: none" />
        <input type="text" ref="keyText" value="No public key selected" class="machines-connector__file-selector-text" readonly />
        <button class="button__select" @click="$refs.file.click()"> Select key </button>
      </div>
      <div class="machines-connector__text-area-container">
        <h2 class="machines-connector__text-area-title">
          Ip address
        </h2>
        <input type="text" ref="ip" placeholder="0.0.0.0/0" class="machines-connector__text-area" />
      </div>
      <div class="machines-connector__request-container">
        <button class="button__connect" @click="connect" > Request </button>
      </div>
    </div>
  </div>
  <Modal
    ref="modal"
    v-show="isModalVisible"
    @close="closeModal"
    :error="error"
  />
  <CertModal
    ref="certModal"
    v-show="isCertModalVisible"
    @close="closeCertModal"
    :cert="cert"
  />
</template>

<script setup>
import Modal from "@/components/modals/error-modal.vue";
import CertModal from "@/components/modals/cert-modal.vue"

const machine = defineProps({
  id: String,
  name: String,
});

</script>

<script>
import { isIP } from "is-ip";
import { generateCertificate } from "@/services/machine.service";
export default {
  name: "machine-connector",
  data() {
    return {
      isModalVisible: false,
      isCertModalVisible: false,
      error: "unknown",
      cert: "unknown"
    };
  },
  methods: {
    selectedFile() {
      this.$refs.keyText.value = "Selected: " + this.$refs.file.files[0].name
    },
    async connect() {
      if (!this.$refs.file.files[0]) {
        this.showModal("You have not selected a public key");
        return;
      } else if (!this.$refs.file.files[0].name.endsWith(".pub")) {
        this.showModal("The selected file is not a .pub file");
        return;
      } else {
        let split = this.$refs.ip.value.split('/')
        if (!isIP(split[0])) {
          this.showModal("The specified IP address is not valid, format: IP/mask");
          return;
        } else if (!split[1]) {
          this.showModal("You haven't specified a subnet mask, format: IP/mask");
          return;
        } else if (!(split[1] >= 0 && split[1] <= 32)) {
          this.showModal("Subnet mask not valid, mask must be between 0 and 32");
          return;
        }
      }

      try {
        const token = await this.$auth0.getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "read:machines",
          },
        });

        // TODO: popup until certificate is loaded
        const { data, error } = await generateCertificate(
          await this.$refs.file.files[0].text(),
          this.$props.id,
          this.$props.name,
          this.$refs.ip.value,
          token
        );

        if (data) {
          this.showCertModal(data);
        }

        if (error) {
          this.showModal(error.message)
        }
      } catch (e) {
        this.showModal(e.message)
      }
    },

    showModal(error) {
      this.error = error
      this.isModalVisible = true;
    },

    closeModal() {
      this.isModalVisible = false;
    },

    showCertModal(cert) {
      this.cert = cert
      this.isCertModalVisible = true;
    },

    closeCertModal() {
      this.isCertModalVisible = false;
    },
  },
};

</script>