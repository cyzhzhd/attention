<template>
  <div class="modal-mask" ref="modal">
    <div class="modal-wrapper" v-on:click="closeModal">
      <mediumWideModal class="modal" v-if="showingModal" @close="showingModal">
        <h3 slot="header" class="header" ref="header">
          <div class="modal-title">집중력 그래프</div>
          <div class="closeModalBtn">
            <i
              class="fa fa-times"
              aria-hidden="true"
              v-on:click="closeModal"
            ></i>
          </div>
        </h3>
        <h4 slot="body">
          그래프
        </h4>
        <h4 slot="footer"></h4>
      </mediumWideModal>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import mediumWideModal from '../../common/mediumWideModal.vue';
import bus from '../../../../utils/bus';

export default {
  name: 'CCTGraph',
  props: ['showingModal'],
  components: {
    mediumWideModal,
  },
  data() {
    return {
    };
  },
  methods: {
    closeModal() {
      this.$emit('closeModal', 'showingCCTModal');
    },
    ...mapActions('modal', ['DragModal']),
  },
  mounted() {
    bus.$on('openCCTGraph', () => {
      this.$nextTick(() => {
        console.log(this.$refs.modal, this.$refs.header);
        this.DragModal({ modal: this.$refs.modal, header: this.$refs.header });
      });
    });
  },
  beforeDestroy() {
    bus.$off('onMessage');
  },
};
</script>

<style scoped>
img {
  max-width: 15%;
}

.modal-mask {
  position: absolute;
  z-index: 9998;
  top: 100px;
  left: 100px;
}
.header {
  cursor: move;
  background-color: aquamarine;
}
.header {
  display: flex;
  padding: 0px 30px;
}
.modal-title {
  flex: 1;
}

.closeModalBtn {
  cursor: pointer;
}
</style>
