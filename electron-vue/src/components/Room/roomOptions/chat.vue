<template>
  <div class="modal-mask" ref="modal">
    <div class="modal-wrapper" v-on:click="closeModal">
      <mediumModal class="modal" v-if="showingModal" @close="showingModal">
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
                <div class="bot-msg" v-if="message.name === 'bot'">
                  <!-- <p>{{ message.sentAt }}</p> -->
                  <p>{{ message.message }}</p>
                </div>
                <div v-else>
                  <div v-if="message.name === name">
                    <div class="sent-msg">
                      <div class="sent-msg-info">
                        <!-- <p>{{ message.sentAt }}</p> -->
                      </div>
                      <div class="sent-msg-text">
                        <p>{{ message.message }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <div class="received-msg">
                      <div class="received-msg-info">
                          <img
                            class="received-msg-img"
                            src="https://ptetutorials.com/images/user-profile.png"
                            alt="sunil"
                          />
                          <p class="sender">{{ message.name }}</p>
                          <!-- <p class="received-msg-sentAt">{{ message.sentAt }}</p> -->
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
                @keyup.enter="sendChat"
                v-model="message"
                type="text"
                class="write-msg"
                placeholder="Type a message"
              />
              <button class="send-button" @click="sendChat">전송</button>
            </div>
          </div>
        </h4>
        <h4 slot="footer"></h4>
      </mediumModal>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import mediumModal from '../../common/mediumModal.vue';
import bus from '../../../../utils/bus';

export default {
  name: 'chat',
  props: ['showingModal'],
  components: {
    mediumModal,
  },
  data() {
    return {
      name: this.$store.state.user.name,
      roomId: this.$route.params.roomId,
      message: null,
      messages: [],
    };
  },
  methods: {
    sendChat() {
      this.SendChat(this.message);
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
      this.$emit('closeModal', 'showingChatModal');
    },

    ...mapActions('webRTC', ['SendChat']),
    ...mapActions('modal', ['DragModal']),
  },

  mounted() {
    this.messages = [
      {
        name: 'bot',
        message: `${this.$store.state.user.name}이 로그인했습니다.`,
      },
    ];
    bus.$on('onMessage', (name, message) => {
      this.messages.push({ name, message });
    });

    bus.$on('openChat', () => {
      this.$nextTick(() => {
        console.log(this.$refs.modal, this.$refs.header);
        this.DragModal({ modal: this.$refs.modal, header: this.$refs.header });
      });
    });
  },
  updated() {
    this.$nextTick(() => this.scrollToEnd());
  },

  beforeDestroy() {
    bus.$off('onMessage');
    bus.$off('openChat');
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
  background-color: #FFFFFF;

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
  background-color: #FEFFD8;
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
  align-items: left;

}

.received-msg-img
{
  widows: 100px;
}

.received-msg-text {
  display: flex;
  justify-content: flex-start;
  flex: 0 1 40px;


  
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
