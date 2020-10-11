<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <medium-input-modal v-if="showingModal" @close="showingModal">
      <div slot="header">교실 만들기</div>
      <div slot="input1">학년 <input type="text" class="input" /></div>
      <div slot="input2">반 <input type="text" class="input" /></div>
      <div slot="input3">담임 <input type="text" class="input" /></div>
      <div slot="input4"></div>
    </medium-input-modal>
  </div>
</template>

<script>
import mediumInputModal from '../common/mediumInputModal.vue';

export default {
  name: 'CreateClassRoomModal',
  props: ['showingModal'],
  components: { mediumInputModal },
  methods: {
    closeModal() {
      this.$emit('closeModal', 'addClassRoomModal');
    },
  },
};
</script>

<style></style>
