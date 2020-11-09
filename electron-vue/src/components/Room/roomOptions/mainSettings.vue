<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <largeModal v-if="showingModal" @close="showingModal">
      <h3 slot="header" class="header">설정</h3>
      <h4 slot="body">
        <video
          ref="videoSettings"
          width="480"
          height="360"
          autoplay
          playsinline
          muted
        ></video>

        <div class="button">
          <button ref="temp">
            <h2>버튼</h2>
          </button>
        </div>

        <div class="setting-options">
          <div class="options">
            학생 목록 정렬 주기<br />
            <input type="text" v-model.trim="sortStudentListInterval" />
          </div>
          <div class="options">
            전체 집중력 그래프 표시 주기<br />
            <input type="text" v-model.trim="CCTDataInterval" />
          </div>
          <div class="options">
            학생 연결 주기<br />
            <input type="text" v-model.trim="rotateStudentInterval" />
          </div>
          <div class="options">
            연결 학생 수<br />
            <input type="text" v-model.trim="numConnectedStudent" />
          </div>
        </div>

        <div>
          <button class="apply-button" @click="applySettings">적용</button>
        </div>
      </h4>
      <h4 class="footer" slot="footer">
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
  data() {
    return {
      sortStudentListInterval: 10,
      CCTDataInterval: 30,
      rotateStudentInterval: 30,
      numConnectedStudent: 3,
    };
  },
  computed: {
    ...mapGetters('webRTC', ['storedLocalVideo']),
  },
  methods: {
    closeModal() {
      this.$emit('closeModal', 'showingSettingModal');
    },
    applySettings() {
      const options = {
        sortStudentListInterval: Number(this.sortStudentListInterval),
        rotateStudentInterval: Number(this.rotateStudentInterval),
        numConnectedStudent: Number(this.numConnectedStudent),
        CCTDataInterval: Number(this.CCTDataInterval),
      };
      this.SettingSetter(options);
    },
    ...mapActions('webRTC', ['ButtonSetter2', 'SettingSetter']),
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
@import url(//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSans-kr.css);
@import url(//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSans-jp.css);
@font-face {
  font-family: 'GmarketSansBold';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff')
    format('woff');
  font-weight: normal;
  font-style: normal;
}

.header {
  padding: 10px;
  height: 30px;
  font-family: 'GmarketSansBold';
  font-size: 24px;
  letter-spacing: -1px;
  background-color: #f6f7fb;
  color: #9097fd;
}

.setting-options {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  height: 100px;
  width: 400px;
}

.options {
  padding: 5px;
  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
  font-size: 15px;
  font-weight: 300;
  letter-spacing: -1px;
}

.apply-button {
  font-family: 'GmarketSansBold';
  font-size: 12px;
  background: #9097fd;
  height: 30px;
  width: 100px;
  padding: 5px;
  border-radius: 10px;
  font-size: 1rem;
  color: white;
}

.footer {
  color: #9097fd;
}
</style>
