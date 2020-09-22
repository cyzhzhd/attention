<template>
  <div class="msg" ref="msg">
    <ul class="msg-container">
      <li v-for="message in messages" v-bind:key="message.key" class="msg-history">
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
      <div class="type-msg">
        <div class="input-msg-write">
          <input
            @keyup.enter="sendMessage"
            v-model="message"
            type="text"
            class="write-msg"
            placeholder="Type a message"
          />
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'chat',
  data() {
    return {
      user: {
        // email: this.$user.email,
        // uid: this.$user.uid,
        displayName: this.$user.displayName,
      },
      roomId: this.$route.params.roomId,
      // data: { type: '', uid: '', message: '' },
      message: null,
      messages: [],
    };
  },
  methods: {
    // net::ERR_EMPTY_RESPONSE 발생
    sendMessage() {
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
        .on('value', (snapshot) => {
          this.messages = [];
          snapshot.forEach((doc) => {
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
      // 나중에 스크롤 중이면 밑으로 안 내려가고 밑에 팝업만 뜨면 좋을듯.
      // 바로 맨 밑으로
      // const content = this.$refs.msg;
      // content.scrollTop = content.scrollHeight;

      // 부드럽게 맨 밑으로
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      const content = this.$el.getElementsByClassName('msg-container')[0];

      content.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    },
  },

  created() {
    this.fetchMessages();
  },
  mounted() {
    this.scrollToEnd();
  },
  updated() {
    this.$nextTick(() => this.scrollToEnd());
    // this.$nextTick(() => this.$refs.msg.scrollIntoView());
  },
};
</script>

<style>
img {
  max-width: 15%;
}
.msg {
  overflow-y: auto;
  height: 400px;
  background-color: gray;
}
.msg-container {
  display: flex;
  flex: 0 1 40px;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 10px;
}
/* .msg-history {
} */
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
.sender {
  font: 1.2rem bold;
}
.bot-msg {
  background-color: gray;
  border-radius: 0.5rem;
}
</style>
