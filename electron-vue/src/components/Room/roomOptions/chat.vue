<template>
  <div class="modal-mask" ref="modal">
    <div class="modal-wrapper" v-on:click="closeModal">
      <movableModal
        :size="modalSize"
        class="modal"
        v-if="chatModal"
        @close="chatModal"
      >
        <h3 slot="header" class="header" ref="header">
          <div class="modal-title">채팅</div>
          <div class="closeModalBtn">
            <i
              class="fa fa-times"
              aria-hidden="true"
              v-on:click="closeModal"
            ></i>
          </div>
        </h3>
        <h4 slot="body">
          <div class="msg" ref="msg">
            <ul class="msg-container">
              <li
                v-for="message in messages"
                v-bind:key="message.message"
                class="msg-history"
              >
                <div>
                  <div v-if="message.name === name">
                    <div class="sent-msg">
                      <div class="sent-msg-info"></div>
                      <div class="sent-msg-text">
                        <p>{{ message.message }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <div class="received-msg">
                      <div class="received-msg-info">
                        <p class="sender">{{ message.name }}</p>
                      </div>
                      <div class="received-msg-text">
                        <p>{{ message.message }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="type-msg">
            <div class="input-msg-write">
              <input
                @keyup.enter="callSendSignal"
                v-model="message"
                type="text"
                class="write-msg"
                placeholder="Type a message"
              />
              <button class="send-button" @click="callSendSignal">전송</button>
            </div>
          </div>
        </h4>
        <h4 slot="footer"></h4>
      </movableModal>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import movableModal from '../../common/movableModal.vue';
import bus from '../../../../utils/bus';

export default {
  name: 'chat',
  components: {
    movableModal,
  },
  data() {
    return {
      name: this.$store.state.user.name,
      roomId: this.$route.params.roomId,
      message: null,
      messages: [],
      modalSize: {
        width: '350px',
        height: '500px',
      },
      numUnseenMessage: 0,
    };
  },
  computed: {
    chatModal() {
      return this.$store.state.modal.modalList.showingChatModal;
    },
  },
  watch: {
    chatModal() {
      if (this.chatModal) {
        this.$store.dispatch('modal/ChangeNumUnseenMessage', 0);
        this.$nextTick(() => {
          console.log(this.$refs.modal, this.$refs.header);
          this.DragModal({
            modal: this.$refs.modal,
            header: this.$refs.header,
          });
        });
      }
    },
  },
  methods: {
    callSendSignal() {
      const options = {
        type: 'sendChat',
        content: this.message,
      };
      this.SendSignal(options);
      this.message = null;
    },
    scrollToEnd() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      const content = this.$el.getElementsByClassName('msg-container')[0];

      content.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    },

    closeModal() {
      this.$store.dispatch('modal/ControlModal', 'showingChatModal');
    },

    ...mapActions('webRTC', ['SendSignal']),
    ...mapActions('modal', ['DragModal']),
  },

  mounted() {
    this.messages = [];
    bus.$on('onMessage', (name, message) => {
      this.messages.push({ name, message });
      if (!this.$store.state.modal.modalList.showingChatModal) {
        this.$store.dispatch('modal/ChangeNumUnseenMessage', 1);
      }
    });
  },
  updated() {
    this.$nextTick(() => this.scrollToEnd());
  },

  beforeDestroy() {
    bus.$off('onMessage');
  },
};
</script>

<style scoped>
@import url(//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSans-kr.css);
@import url(//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSans-jp.css);

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
  display: flex;
  cursor: move;
  color: #9097fd;
  font-family: 'GmarketSansBold';
  font-size: 20px;
  letter-spacing: -1px;

  background-color: #ffffff;
  height: 50px;
  padding: 0px 30px;
}
.modal-title {
  flex: 1;
  text-align: left;
}

.closeModalBtn {
  cursor: pointer;
}

.msg {
  overflow-y: auto;
  height: 380px;
  background-color: #ffffff;
}
.msg-container {
  display: flex;
  flex: 0 1 40px;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 10px;
}

.bot-msg {
  padding-left: 5px;
  padding-right: 5px;
  margin-right: 10px;
  margin: 4px;

  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
  font-size: 15px;
  font-weight: normal;
  letter-spacing: -1px;
}
.sent-msg-text {
  background-color: #feffd8;
  border-radius: 0.5rem;
  padding: 5px;
  margin: 4px;
  margin-right: 10px;

  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
  font-size: 15px;
  font-weight: normal;
  letter-spacing: -1px;
}

.received-msg {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.received-msg-img {
  widows: 100px;
}

.received-msg-text {
  display: flex;
  justify-content: flex-start;

  background-color: #eaebff;
  border-radius: 0.5rem;
  padding: 5px;
  margin: 4px;
  margin-left: 10px;

  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
  font-size: 15px;
  font-weight: normal;
  letter-spacing: -1px;
}
.received-msg-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 50px;
}

.sent-msg-info {
  display: flex;
  justify-content: flex-end;
}

.input-msg-write {
  display: flex;
  /* margin-top: 2px; */
}
.write-msg {
  flex: 1;
  margin: 10px;
}
.send-button {
  background-color: #9097fd;
  color: #ffffff;
  margin-right: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.sender {
  font: 1.2rem bold;
  font-size: 16px;
}
.bot-msg {
  align-items: center;
  border-radius: 0.5rem;
}
</style>
