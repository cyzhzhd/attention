<template>
  <div class="container">
    <h3 class="text-center">
      Messaging
      <a @click="leaveRoom">(back)</a>
    </h3>
    <div class="messaging">
      <div class="inbox_msg">
        <div class="mesgs">
          <div class="msg_history">
            <div v-for="message in messages" v-bind:key="message.key" class="incoming_msg">
              <div class="incoming_msg_img">
                <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" />
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
        <div class>
          online
          <div v-for="user in userList" v-bind:key="user.email">{{user.nickname}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'myPrivateChat',
  data() {
    return {
      roomid: this.$route.params.roomid,
      roomname: this.$route.params.roomname,
      user: {
        email: 'email address',
        nickname: this.$route.params.nickname,
      },
      data: { type: '', nickname: '', message: '' },
      message: null,
      messages: [],
      userList: [],
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
        .onSnapshot((querySnapshot) => {
          const allMessages = [];
          querySnapshot.forEach((doc) => {
            const message = doc.data();
            message.key = doc.id;
            allMessages.push(message);
          });
          this.messages = allMessages;
        });
    },

    fetchUserList() {
      this.db.onSnapshot((querySnapshot) => {
        this.userList = querySnapshot.data().userOnline;
        console.log(querySnapshot.data().userOnline);
      });
    },
    enterRoom() {
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayUnion(this.user),
      });
    },

    leaveRoom() {
      this.$router.go(-1);
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayRemove(this.user),
      });
    },

    // 함수형 프로그래밍으로 중복을 제거할 방법?
    updateLogIn() {
      this.$router.go(-1);
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayRemove(this.user),
      });
    },
  },

  created() {
    this.fetchMessages();
    this.fetchUserList();
    this.enterRoom();
  },
};
</script>

<style scoped="">
.container {
  max-width: 1170px;
  margin: auto;
}
img {
  max-width: 100%;
}
.inbox_people {
  background: #f8f8f8 none repeat scroll 0 0;
  float: left;
  overflow: hidden;
  width: 40%;
  border-right: 1px solid #c4c4c4;
}
.inbox_msg {
  border: 1px solid #c4c4c4;
  clear: both;
  overflow: hidden;
}
.top_spac {
  margin: 20px 0 0;
}

.recent_heading {
  float: left;
  width: 40%;
}
.srch_bar {
  display: inline-block;
  text-align: right;
  width: 60%;
}
.headind_srch {
  padding: 10px 29px 10px 20px;
  overflow: hidden;
  border-bottom: 1px solid #c4c4c4;
}

.recent_heading h4 {
  color: #05728f;
  font-size: 21px;
  margin: auto;
}
.srch_bar input {
  border: 1px solid #cdcdcd;
  border-width: 0 0 1px 0;
  width: 80%;
  padding: 2px 0 4px 6px;
  background: none;
}
.srch_bar .input-group-addon button {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  padding: 0;
  color: #707070;
  font-size: 18px;
}
.srch_bar .input-group-addon {
  margin: 0 0 0 -27px;
}

.chat_ib h5 {
  font-size: 15px;
  color: #464646;
  margin: 0 0 8px 0;
}
.chat_ib h5 span {
  font-size: 13px;
  float: right;
}
.chat_ib p {
  font-size: 14px;
  color: #989898;
  margin: auto;
}
.chat_img {
  float: left;
  width: 11%;
}
.chat_ib {
  float: left;
  padding: 0 0 0 15px;
  width: 88%;
}

.chat_people {
  overflow: hidden;
  clear: both;
}
.chat_list {
  border-bottom: 1px solid #c4c4c4;
  margin: 0;
  padding: 18px 16px 10px;
}
.inbox_chat {
  height: 550px;
  overflow-y: scroll;
}

.active_chat {
  background: #ebebeb;
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
.time_date {
  color: #747474;
  display: block;
  font-size: 12px;
  margin: 8px 0 0;
}
.received_withd_msg {
  width: 57%;
}
.mesgs {
  float: left;
  padding: 30px 15px 0 25px;
  width: 60%;
}

.sent_msg p {
  background: #05728f none repeat scroll 0 0;
  border-radius: 3px;
  font-size: 14px;
  margin: 0;
  color: #fff;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
.outgoing_msg {
  overflow: hidden;
  margin: 26px 0 26px;
}
.sent_msg {
  float: right;
  width: 46%;
}
.input_msg_write input {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 48px;
  width: 100%;
}

.type_msg {
  border-top: 1px solid #c4c4c4;
  position: relative;
}
.msg_send_btn {
  background: #05728f none repeat scroll 0 0;
  border: medium none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 17px;
  height: 33px;
  position: absolute;
  right: 0;
  top: 11px;
  width: 33px;
}
.messaging {
  padding: 0 0 50px 0;
}
.msg_history {
  height: 516px;
  overflow-y: auto;
}
</style>
