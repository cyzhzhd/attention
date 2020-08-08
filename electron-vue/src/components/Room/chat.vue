<template>
  <div>
    <div class="msg_history">
      <div
        v-for="message in messages"
        v-bind:key="message.key"
        class="incoming_msg"
      >
        <div class="incoming_msg_img">
          <img
            src="https://ptetutorials.com/images/user-profile.png"
            alt="sunil"
          />
        </div>
        <div class="received_msg">
          <div class="received_withd_msg">
            <p>{{ message.message }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="type_msg">
      <div class="input_msg_write">
        <input
          @keyup.enter="saveMessage"
          v-model="message"
          type="text"
          class="write_msg"
          placeholder="Type a message"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'chat',
  data() {
    return {
      user: {
        email: 'email address',
        nickname: this.$route.params.nickname,
      },
      data: { type: '', nickname: '', message: '' },
      message: null,
      messages: [],
      db: this.$firebase
        .firestore()
        .collection('rooms')
        .doc(this.$route.params.roomid),
    };
  },
  methods: {
    saveMessage() {
      this.db.collection('messages').add({
        sender: this.user.nickname,
        message: this.message,
        createdAt: new Date(),
      });

      this.message = null;
    },

    fetchMessages() {
      this.db
        .collection('messages')
        .orderBy('createdAt')
        .onSnapshot(querySnapshot => {
          const allMessages = [];
          querySnapshot.forEach(doc => {
            const message = doc.data();
            message.key = doc.id;
            allMessages.push(message);
          });
          this.messages = allMessages;
        });
    },
  },

  created() {
    this.fetchMessages();
  },
};
</script>

<style scoped="">
img {
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
.msg_history {
  height: 516px;
  overflow-y: auto;
}
.input_msg_write input {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 48px;
  width: 100%;
}
</style>
