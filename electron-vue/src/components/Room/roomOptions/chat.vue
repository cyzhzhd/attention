<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <mediumModal v-if="showingModal" @close="showingModal">
      <h3 slot="header" class="header">
        <div class="modal-title">채팅</div>
        <div class="closeModalBtn">
          <i class="fa fa-times" aria-hidden="true" v-on:click="closeModal"></i>
        </div>
      </h3>
      <h4 slot="body">
        <div class="msg" ref="msg">
          <ul class="msg-container">
            <li
              v-for="message in messages"
              v-bind:key="message.key"
              class="msg-history"
            >
              <div class="bot-msg" v-if="message.sender === 'bot'">
                <p>{{ message.sentAt }}</p>
                <p>{{ message.message }}</p>
              </div>
              <div v-else>
                <div v-if="message.sender === user.displayName">
                  <div class="sent-msg">
                    <div class="sent-msg-info">
                      <p>{{ message.sentAt }}</p>
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
                      <p class="sender">{{ message.sender }}</p>
                      <p class="received-msg-sentAt">{{ message.sentAt }}</p>
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
              @keyup.enter="sendMessage"
              v-model="message"
              type="text"
              class="write-msg"
              placeholder="Type a message"
            />
            <button class="send-button" @click="sendMessage">전송</button>
          </div>
        </div>
      </h4>
      <h4 slot="footer"></h4>
    </mediumModal>
  </div>
</template>

<script>
import mediumModal from '../../common/mediumModal.vue';

export default {
  name: 'chat',
  props: ['showingModal'],
  components: {
    mediumModal,
  },
  data() {
    return {
      user: {
        displayName: this.$user.displayName,
      },
      roomId: this.$route.params.roomId,
      message: null,
      messages: [],
    };
  },
  methods: {
    // net::ERR_EMPTY_RESPONSE 발생
    sendMessage() {
      if (!this.message) return;
      const options = {
        roomId: this.roomId,
        displayName: this.user.displayName,
        message: this.message,
      };
      this.$http.post('/api/firebase/message/', options);

      this.message = null;
    },

    fetchMessages() {
      this.$firebase
        .database()
        .ref(`/messageHub/${this.roomId}/messages`)
        .on('value', snapshot => {
          this.messages = [];
          snapshot.forEach(doc => {
            const item = doc.val();
            item.key = doc.key;

            const time = new Date(item.sentAt);
            item.sentAt = time.toLocaleTimeString(navigator.language, {
              hour: '2-digit',
              minute: '2-digit',
            });
            this.messages.push(item);
          });
        });
    },

    scrollToEnd() {
      // 부드럽게 맨 밑으로
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
  },

  created() {
    this.fetchMessages();
  },
  updated() {
    this.$nextTick(() => this.scrollToEnd());
  },
};
</script>

<style scoped>
img {
  max-width: 15%;
}
.msg {
  overflow-y: auto;
  height: 380px;
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
}
.sent-msg-text {
  background-color: gold;
  border-radius: 0.5rem;
  padding: 5px;
}
.received-msg-text {
  display: flex;
  justify-content: flex-start;
  flex: 0 1 40px;
  background-color: aquamarine;
  border-radius: 0.5rem;
  padding: 5px;
}
.sent-msg-info {
  display: flex;
  justify-content: flex-end;
}
.received-msg-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-msg-write {
  display: flex;
  /* margin-top: 2px; */
}
.write-msg {
  flex: 1;
}
.send-button {
  background-color: yellow;
}

.sender {
  font: 1.2rem bold;
}
.bot-msg {
  background-color: gray;
  border-radius: 0.5rem;
}
.header {
  display: flex;
  padding: 0px 30px;
}
.modal-title {
  flex: 1;
}
</style>
