<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <Modal :size="modalSize" v-if="screenShareModal" @close="screenShareModal">
      <h3 slot="header" class="header">
        <div class="modal-title">화면 공유</div>
        <div class="closeModalBtn">
          <i class="fa fa-times" aria-hidden="true" v-on:click="closeModal"></i>
        </div>
      </h3>
      <h4 class="body" slot="body">
        <div ref="screenNames" id="screenNames"></div>
        <div ref="screenInfo" id="screenInfo"></div>
        <div ref="canvas" class="canvas"></div>
        <div
          class="screen-thumbnail"
          ref="screenVideos"
          id="screenVideos"
        ></div>
      </h4>
      <h4 slot="footer">
        <button class="share-button">공유하기</button>
      </h4>
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Modal from '../../common/Modal.vue';

export default {
  name: 'screen-sharing',
  components: {
    Modal,
  },
  data() {
    return {
      modalSize: {
        width: '100%',
        height: '700px',
      },
    };
  },
  computed: {
    screenShareModal() {
      return this.$store.state.modal.modalList.showingScreenSharingModal;
    },
  },
  watch: {
    screenShareModal() {
      if (this.screenShareModal) {
        this.$nextTick(() => {
          const payload = {
            canvas: this.$refs.canvas,
            screenNames: this.$refs.screenNames,
            screenInfo: this.$refs.screenInfo,
            screenVideos: this.$refs.screenVideos,
            captureScreens: this.$refs.captureScreens,
          };
          this.VariableSetter(payload);
          this.CaptureScreens();
        });
      }
    },
  },
  methods: {
    closeModal() {
      this.$store.dispatch('modal/ControlModal', 'showingScreenSharingModal');
    },
    ...mapActions('electron', ['VariableSetter', 'CaptureScreens']),
  },
};
</script>

<style scoped>
.canvas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, auto));
  gap: 5%;
  height: 560px;
  overflow-y: auto;
  /* border: 1px solid #333333; */
}

.canvas div:hover {
  background: gray;
  cursor: pointer;
}

.body {
  background-color: #ffffff;
  border: 5px solid #eaebff;
  border-radius: 20px;
  padding: 20px;
  height: 500px;
}
.header {
  display: flex;
  cursor: move;
  color: #9097fd;
  background-color: #ffffff;
  height: 50px;
  padding: 0px 30px;
  font-family: 'GmarketSansBold';
  font-size: 24px;
  letter-spacing: -1px;
}
.modal-title {
  flex: 1;
}

.share-button {
  background: #9097fd;
  height: 30px;
  width: 100px;
  padding: 5px;
  border-radius: 10px;
  font-size: 1rem;
  color: white;
  /* margin: 20px; */
}
</style>
