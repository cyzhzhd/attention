<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <largeModal v-if="showingModal" @close="showingModal">
      <h3 slot="header">설정</h3>
      <h4 slot="body">
        <video
          ref="videoSettings"
          width="480"
          height="360"
          autoplay
          playsinline
          muted
        ></video>

        <div class="options">
          <button ref="temp">
            <h2>버튼</h2>
          </button>
        </div>
      </h4>
      <h4 slot="footer">
        <i
          class="fa fa-times closeModalBtn fa-2x"
          aria-hidden="true"
          v-on:click="closeModal"
        ></i>
      </h4>
    </largeModal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import largeModal from '../../common/largeModal.vue';
import bus from '../../../../utils/bus';

export default {
  name: 'main-settings',
  props: ['showingModal'],
  components: {
    largeModal,
  },
  computed: {
    ...mapGetters('webRTC', ['storedLocalVideo']),
  },
  methods: {
    closeModal() {
      this.$emit('closeModal', 'showingSettingModal');
    },
    ...mapActions('webRTC', ['ButtonSetter2']),
  },
  mounted() {
    bus.$on('videoSetting', () => {
      this.$nextTick(() => {
        this.$refs.videoSettings.srcObject = this.storedLocalVideo.srcObject;
        this.ButtonSetter2(this.$refs.temp);
      });
    });
  },

  beforeDestroy() {
    bus.$off('videoSetting');
  },
};
</script>

<style>
</style>