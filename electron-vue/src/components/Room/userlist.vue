<template>
  <div class="userlist-vue">
    <div class="userlist">
      <ul>
        <li
          v-for="userInfo in storedConnectedUsers"
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
            <!-- <figure class="CCTIcon"></figure> -->
            {{ userInfo.name }}
          </div>
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
import { mapGetters, mapActions } from 'vuex';
import 'vue-context/src/sass/vue-context.scss';

export default {
  name: 'userlist',
  components: { VueContext },
  computed: {
    ...mapGetters('webRTC', ['storedConnectedUsers'])
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
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
};
</script>

<style>
.userlist-vue {
  background-color: #e4f6f1;
  min-height: 100%;
}
.userlist {
  position: absolute;
  height: 82.5vh;
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
