<template>
  <div>
    <div class="user-list">
      Total User
      <ul>
        <li v-for="userInfo in totalUser" v-bind:key="userInfo.uid">
          {{ userInfo.userName }}
        </li>
      </ul>
      <br />
      Online
      <ul>
        <li v-for="userInfo in logInUser" v-bind:key="userInfo.uid">
          <p @contextmenu.prevent="$refs.menu.open($event, userInfo)">
            {{ userInfo.displayName }}
          </p>
        </li>
      </ul>
    </div>
    <vue-context ref="menu">
      <template slot-scope="child">
        <li>
          <a @click.prevent="connect(child.data)">연결 하기</a>
        </li>
        <li>
          <a @click.prevent="disconnect(child.data)">연결 해제 하기</a>
        </li>
      </template>
    </vue-context>
  </div>
</template>

<script>
import VueContext from 'vue-context';
import { mapActions } from 'vuex';
import 'vue-context/src/sass/vue-context.scss';

export default {
  name: 'USERLIST',

  components: { VueContext },

  data() {
    return {
      roomId: this.$route.params.roomId,
      logInUser: [],
      totalUser: [],
    };
  },
  methods: {
    connect(data) {
      console.log('connect with ', data);
      this.ConnectWithTheUser(data);
    },
    disconnect(data) {
      console.log('disconnect with ', data);
      this.DisconnectWithTheUser(data);
    },
    ...mapActions('webRTC', ['ConnectWithTheUser', 'DisconnectWithTheUser']),
  },
  created() {
    this.$firebase
      .database()
      .ref(`/rooms/${this.roomId}/userlist`)
      .on('value', snapshot => {
        const userlist = [];
        snapshot.forEach(doc => {
          userlist.push(doc.val());
        });
        this.totalUser = userlist;
      });

    this.$firebase
      .database()
      .ref(`/rooms/${this.roomId}/userOnline`)
      .on('value', snapshot => {
        const userlist = [];
        snapshot.forEach(doc => {
          userlist.push(doc.val());
        });
        this.logInUser = userlist;
      });
  },
};
</script>

<style></style>
