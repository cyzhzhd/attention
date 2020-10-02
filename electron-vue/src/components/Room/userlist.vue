<template>
  <div class="userlist-vue">
    <div class="online-total">
      <p class="button" @click.prevent="activeTotalUserList">
        <a href="#">all</a>
      </p>
      <p class="button" @click.prevent="activeOnlineUserList">
        <a href="#">online</a>
      </p>
    </div>
    <div class="userlist">
      <ul v-if="hasOnlineActive">
        <li
          class="userlist-onlie"
          v-for="userInfo in logInUser"
          v-bind:key="userInfo._id"
        >
          <div @click.prevent="$refs.menu.open($event, userInfo)" @click.stop>
            <figure
              class="userlist-profile"
              :style="{
                backgroundImage:
                  'url(' + require('../../assets/img/room/profile.png') + ')',
              }"
            ></figure>
            {{ userInfo.name }}
          </div>
        </li>
      </ul>
      <ul v-else>
        <li
          class="userlist-total"
          v-for="userInfo in totalUser"
          v-bind:key="userInfo.uid"
        >
          {{ userInfo.userName }}
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
import bus from '../../../utils/bus';

export default {
  name: 'userlist',

  components: { VueContext },

  data() {
    return {
      roomId: this.$route.params.roomId,
      logInUser: [],
      totalUser: [],
      hasOnlineActive: true,
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

    activeOnlineUserList() {
      this.hasOnlineActive = true;
    },
    activeTotalUserList() {
      this.hasOnlineActive = false;
    },
    ...mapActions('webRTC', ['ConnectWithTheUser', 'DisconnectWithTheUser']),
  },
  created() {
    // bus이용해서 바뀔때마다 업데이트?
    bus.$on('userlist-update', userlist => {
      console.log(userlist);
      this.logInUser = userlist;
    });

    // this.$firebase
    //   .database()
    //   .ref(`/rooms/${this.roomId}/userlist`)
    //   .on('value', snapshot => {
    //     const userlist = [];
    //     snapshot.forEach(doc => {
    //       userlist.push(doc.val());
    //     });
    //     this.totalUser = userlist;
    //   });
    // this.$firebase
    //   .database()
    //   .ref(`/rooms/${this.roomId}/userOnline`)
    //   .on('value', snapshot => {
    //     const userlist = [];
    //     snapshot.forEach(doc => {
    //       userlist.push(doc.val());
    //     });
    //     this.logInUser = userlist;
    //   });
  },
};
</script>

<style>
.userlist-vue {
  /* display: flex; */
  background-color: #e4f6f1;
  min-height: 100%;
}
.userlist {
  position: absolute;
  width: 100px;
  margin-top: 10px;
  overflow-y: auto;
}

.userlist-profile {
  display: flex;
  flex-direction: column;
  margin: 0.7rem;
  border-radius: 5rem;
  background: white;

  height: 0;
  padding-bottom: 80%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.userlist-onlie {
  cursor: pointer;
}
.userlist-total {
  /* padding-top: 0.5rem; */
  padding-bottom: 0.5rem;
  cursor: pointer;
}
.online-total {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  margin-top: 20px;
  height: 70px;
}
.button {
  background-color: #c9caca;

  height: 30px;
  border-radius: 8px;
  width: 80px;
  font-size: 0.8rem;
}
.button a {
  text-decoration: none;
  margin-top: 7px;
  color: black;
}</style
>>
