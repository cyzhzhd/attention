<template>
  <vue-context>
    <template slot-scope="child">
      <li>
        <a @click.prevent="manageTeam(child.data)">팀 관리</a>
      </li>
      <li>
        <a @click.prevent="leaveTeam(child.data)">팀 나가기</a>
      </li>
      <li>
        <a @click.prevent="deleteTeam(child.data)">팀 삭제</a>
      </li>
    </template>
  </vue-context>
</template>

<script>
import VueContext from 'vue-context';
import 'vue-context/src/sass/vue-context.scss';

export default {
  name: 'ContextMenu',
  props: {},
  component: {
    VueContext,
  },
  data() {
    return {
      uid: this.$user.uid,
    };
  },
  methods: {
    manageTeam(room) {
      this.$router.push({
        name: 'TeamSettings',
        params: { roomId: room.roomId, roomName: room.roomName },
      });
    },

    leaveTeam(room) {
      if (room.host === this.uid) {
        this.roomId = room.roomId;
        this.modalList.showingHandOverModal = true;
      } else {
        const options = {
          roomId: room.roomId,
          uid: this.uid,
        };
        this.$http.post(
          'https://be.swm183.com:3000/firebase/leaveTeam',
          options,
        );
      }
    },

    deleteTeam(room) {
      if (room.host === this.uid) {
        this.modalList.showingConfirmModal = true;
        this.roomId = room.roomId;
      }
    },
  },
};
</script>

<style></style>
