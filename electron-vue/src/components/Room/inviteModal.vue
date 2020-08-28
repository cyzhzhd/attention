<template>
  <div class="modal-wrapper" v-on:click="$emit('closemodal')">
    <Modal v-if="showModal" @close="showModal">
      <h3 slot="header">Copy this roomId and give it to your student</h3>

      <h4 slot="body">{{ this.$route.params.roomId }}</h4>
      <h4 slot="footer">
        <i
          class="fa fa-times closeModalBtn fa-2x"
          aria-hidden="true"
          v-on:click="$emit('closemodal')"
        ></i>
      </h4>
    </Modal>
  </div>
</template>

<script>
import Modal from '../common/Modal.vue';

export default {
  components: {
    Modal,
  },
  props: ['showModal'],
};
</script>

<style></style>
