<template>
  <div class="modal-wrapper" v-on:click="$emit('closemodal')">
    <smallModal v-if="showModal" @close="showModal">
      <h3 slot="header">Copy this roomId and give it to your student</h3>

      <h4 slot="body">{{ this.$route.params.roomId }}</h4>
      <h4 slot="footer">
        <i
          class="fa fa-times closeModalBtn fa-2x"
          aria-hidden="true"
          v-on:click="$emit('closemodal')"
        ></i>
      </h4>
    </smallModal>
  </div>
</template>

<script>
import smallModal from '../common/smallModal.vue';

export default {
  components: {
    smallModal,
  },
  props: ['showModal'],
};
</script>

<style></style>
