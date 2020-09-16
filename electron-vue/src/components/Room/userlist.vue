<template>
  <div>
    <nav class="online-total">
      <ul class="menu">
        <li class="menu-item-userlist" @click.prevent="activeOnlineUserList">
          <a href="#" class="menu-link-userlist">참여중</a>
        </li>
        <li class="menu-item-userlist" @click.prevent="activeTotalUserList">
          <a href="#" class="menu-link-userlist">전체</a>
        </li>
      </ul>
    </nav>
    <div class="userlist">
      <ul v-if="hasOnlineActive">
        <li class="userlist-onlie" v-for="userInfo in logInUser" v-bind:key="userInfo.uid">
          <div @click.prevent="$refs.menu.open($event, userInfo)" @click.stop>
            <figure
              class="userlist-profile"
              :style="{
                backgroundImage: 'url(' + require('../../assets/profile.png') + ')',
              }"
            ></figure>
            {{ userInfo.displayName }}
          </div>
        </li>
      </ul>
      <ul v-else>
        <li
          class="userlist-total"
          v-for="userInfo in totalUser"
          v-bind:key="userInfo.uid"
        >{{ userInfo.userName }}</li>
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
    this.$firebase
      .database()
      .ref(`/rooms/${this.roomId}/userlist`)
      .on('value', (snapshot) => {
        const userlist = [];
        snapshot.forEach((doc) => {
          userlist.push(doc.val());
        });
        this.totalUser = userlist;
      });

    this.$firebase
      .database()
      .ref(`/rooms/${this.roomId}/userOnline`)
      .on('value', (snapshot) => {
        const userlist = [];
        snapshot.forEach((doc) => {
          userlist.push(doc.val());
        });
        this.logInUser = userlist;
      });
  },
};
</script>

<style>
.menu {
  display: flex;
}
.menu-item-userlist {
  background: white;
  width: 50%;
  transition: 0.5s;
}
.menu-item-userlist:hover {
  background: #00d39d;
  width: 55%;
}
.menu-link-userlist {
  display: block;
  padding: 0.5rem;
  font-size: 0.6rem;
  font-weight: bold;
  color: #333333;
  text-decoration: none;
  text-align: center;
}
.menu-link-userlist:hover {
  color: white;
}

.userlist {
  position: absolute;
  width: 90px;
  height: 600px;
  margin-top: 10px;
  margin-left: 5px;
  overflow-y: auto;

  background: #ffffff;
  box-shadow: 0px 0px 10px 2px rgba(10, 8, 2, 0.2);
  border-radius: 20px;
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

.userlist-total {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>>
