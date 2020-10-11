<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <largeModal v-if="showingModal" @close="showingModal">
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
        <div ref="screenVideos" id="screenVideos"></div>
      </h4>
      <h4 slot="footer">
        <button class="share-button">공유하기</button>
      </h4>
    </largeModal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import largeModal from '../../common/largeModal.vue';
import bus from '../../../../utils/bus';

export default {
  name: 'screen-sharing',
  props: ['showingModal'],
  components: {
    largeModal,
  },
  methods: {
    closeModal() {
      this.$emit('closeModal', 'showingScreenSharingModal');
    },
    ...mapActions('electron', ['VariableSetter', 'CaptureScreens']),
  },

  mounted() {
    bus.$on('screenSharing', () => {
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
    });

    bus.$on('closeModal', () => this.closeModal());
  },

  beforeDestroy() {
    bus.$off('screenSharing');
    bus.$off('closeModal');
  },
};
</script>

<style>
.canvas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, auto));

  gap: 5%;
  height: 560px;
  overflow-y: auto;
}

.canvas div:hover {
  background: gray;
  cursor: pointer;
}

.body {
  border: 1px solid gray;
  padding: 3px;
}
.header {
  display: flex;
  padding: 0px 30px;
}
.modal-title {
  flex: 1;
}

.share-button {
  background: #12ac85;
  padding: 5px;
  border-radius: 10px;
  font-size: 1rem;
  color: white;
}
</style>
