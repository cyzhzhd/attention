<template>
  <div>
    <ul class="msg">
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
      <div class="type-msg">
        <div class="input-msg-write">
          <input
            @keyup.enter="saveMessage"
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
        email: this.$user.email,
        uid: this.$user.uid,
        displayName: this.$user.displayName,
      },
      roomId: this.$route.params.roomId,
      data: { type: '', uid: '', message: '' },
      message: null,
      messages: [],
    };
  },
  methods: {
    saveMessage() {
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
  },

  created() {
    this.fetchMessages();
    console.log('roomID', this.roomId);
  },
};
</script>

<style>
img {
  max-width: 15%;
}
.msg {
  overflow-y: auto;
  height: 516px;
}
.msg-history {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  flex: 0 1 40px;
}
.sent-msg-text {
  background-color: gold;
  border-radius: 0.5rem;
  padding: 5px;
}
.received-msg-text {
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

/* img {
  max-width: 100%;
}
.incoming_msg_img {
  display: inline-block;
  width: 6%;
}
.received_msg {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
}
.received_withd_msg p {
  background: #ebebeb none repeat scroll 0 0;
  border-radius: 3px;
  color: #646464;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
.received_withd_msg {
  width: 57%;
}
.send_msg {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  color: #743333;
  width: 92%;
}
.send_withd_msg p {
  position: relative;
  background: #eeff00 none repeat scroll 0 0;
  border-radius: 3px;
  color: #033f28;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 80%;
  left: 90%;
}
.send_withd_msg {
  width: 57%;
}
.msg_history {
  height: 516px;
  width: 420px;
  overflow-y: auto;
}
.input_msg_write input {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 48px;
  width: 100%;
} */
</style>
