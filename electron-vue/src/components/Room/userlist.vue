<template>
  <div class="userlist-vue">
    <div class="userlist">
      <ul>
        <li v-for="userInfo in storedConnectedUsers" v-bind:key="userInfo._id">
          <div @click.prevent="$refs.menu.open($event, userInfo)" @click.stop>
            <div class="CCTIcon" v-if="$store.state.user.isTeacher">
              <figure
                class="hpBar"
                v-if="userInfo.CCTData.avr.num > 0"
                :style="{
                  backgroundImage:
                    'url(' + require('../../assets/img/room/energy.png') + ')',
                }"
              ></figure>
              <figure
                class="backGround"
                v-if="userInfo.CCTData.avr.num > 0"
                :style="{
                  backgroundImage:
                    'url(' +
                    require('../../assets/img/room/energy-background.png') +
                    ')',
                  width: `${
                    20 -
                    userInfo.CCTData.CCT.focusPoint[
                      userInfo.CCTData.avr.num - 1
                    ] /
                      5
                  }px`,
                }"
              ></figure>
              <figure
                class="hpBar"
                v-if="userInfo.CCTData.avr.num === 0"
                :style="{
                  backgroundImage:
                    'url(' +
                    require('../../assets/img/room/energyRed.png') +
                    ')',
                  width: `${
                    20 -
                    userInfo.CCTData.CCT.focusPoint[
                      userInfo.CCTData.avr.num - 1
                    ] /
                      5
                  }px`,
                }"
              ></figure>
            </div>
            <figure
              class="userlist-profile"
              :style="{
                backgroundImage:
                  'url(' + require('../../assets/img/room/student-boy') + ')',
              }"
            ></figure>
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
    ...mapGetters('webRTC', ['storedConnectedUsers']),
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

<style scoped>
.userlist-vue {
  /* background-color: #e4f6f1; */
  min-height: 100%;
}
.userlist {
  position: absolute;
  height: 75vh;
  width: 100px;
  margin-top: 10px;
  overflow-y: auto;
}

.userlist-profile {
  display: flex;
  flex-direction: column;
  margin: 0.2rem 0.5rem;
  border-radius: 5rem;
  background: white;
  border: 1px solid #9097fd;

  height: 0;
  padding-bottom: 80%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.hpBar {
  width: 20px;
}
.backGround {
  z-index: 101;
  margin-top: -20px;
  /* width: 10px; */
}
.CCTIcon {
  position: absolute;
  z-index: 100;
  transform: rotate(90deg);
}
.CCTIcon figure {
  height: 20px;
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
}
</style>
>
