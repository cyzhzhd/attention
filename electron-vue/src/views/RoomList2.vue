<template>
  <div class="page">
    <header class="header1">
      <h2 class="category">Room List</h2>
      <router-link class="add-room" :to="{ name: 'AddRoom' }" action
        >Add room</router-link
      >
    </header>
    <header class="header2">
      <h2 class="notice-header">공지사항</h2>
    </header>
    <section class="room">
      <ul class="room-list">
        <li class="room-item" v-for="room in rooms" :key="room.roomId">
          <p
            class="room-settings"
            @click.prevent="
              $refs.menu.open($event, {
                roomId: room.roomId,
                roomName: room.roomName,
                host: room.host,
              })
            "
            @click.stop
          >
            <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
          </p>
          <router-link
            class="room-name"
            :to="{
              name: 'Room',
              params: {
                roomId: room.roomId,
                roomName: room.roomName,
              },
            }"
            action
          >
            <figure
              class="room-image"
              :style="{
                backgroundImage: 'url(' + require('../assets/cat.png') + ')',
              }"
            ></figure>
            {{ room.roomName }}
          </router-link>
        </li>
      </ul>
    </section>
    <section class="notice">
      <div class="contents">
        <ul class="content-list">
          <li class="content-item">
            수학
            <p>
              1. 숙제해오기
              <br />2. 3번 풀어오기
            </p>
          </li>
          <li class="content-item">
            영어
            <p>
              1. 2단원 지문 3번 읽기
              <br />2. 3단원 듣기테스트 2개 듣기 <br />3. 3단원 단어 30문제
              테스트
            </p>
          </li>
        </ul>
      </div>
    </section>
    <vue-context ref="menu">
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
    <handoverModal
      v-bind:showModal="modalList.showingHandOverModal"
      v-bind:roomId="roomId"
      v-on:closemodal="closeModal('showingHandOverModal')"
    ></handoverModal>
    <div class="modal-wrapper" v-on:click="closeModal('showingConfirmModal')">
      <smallModal
        v-if="modalList.showingConfirmModal"
        @close="modalList.showingConfirmModal"
      >
        <h3 slot="header">방을 삭제하려면 '확인'을 입력해주세요</h3>

        <h4 slot="body">
          <form v-on:submit.prevent="confirm">
            <input type="text" v-model.trim="textConfirm" placeholder="확인" />
            <button type="submit" variant="primary" :disabled="!confirm">
              확인
            </button>
          </form>
        </h4>
        <h6 slot="footer">
          이 행동은 되돌릴 수 없습니다.
          <i
            class="fa fa-times closeModalBtn fa-2x"
            aria-hidden="true"
            v-on:click="closeModal('showingConfirmModal')"
          ></i>
        </h6>
      </smallModal>
    </div>
  </div>
</template>

<script>
import VueContext from 'vue-context';
import 'vue-context/src/sass/vue-context.scss';
import handoverModal from '../components/RoomList/handoverModal.vue';
import smallModal from '../components/common/smallModal.vue';

export default {
  name: 'roomList',
  components: { VueContext, handoverModal, smallModal },

  data() {
    return {
      uid: this.$user.uid,
      modalList: {
        showingHandOverModal: false,
        showingConfirmModal: false,
      },
      rooms: [],
      roomId: '',
      textConfirm: '',
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
        this.$http.post('/api/firebase/leaveTeam', options);
      }
    },

    deleteTeam(room) {
      if (room.host === this.uid) {
        this.modalList.showingConfirmModal = true;
        this.roomId = room.roomId;
      }
    },

    confirm() {
      if (this.textConfirm === '확인') {
        this.closeModal('showingConfirmModal');

        const options = {
          roomId: this.roomId,
          uid: this.uid,
        };
        this.$http.post('/api/firebase/deleteTeam', options);
      }
    },

    closeModal(modelName) {
      this.modalList[modelName] = false;
      this.textConfirm = '';
    },
  },

  created() {
    console.log('uid = ', this.uid);
    this.$firebase
      .database()
      .ref(`/users/${this.uid}/favRooms/`)
      .on('value', snapshot => {
        this.rooms = [];
        snapshot.forEach(doc => {
          const item = doc.val().roomDetail;
          item.roomId = doc.key;
          this.rooms.push(item);
        });
      });
  },
};
</script>

<style>
.room {
  padding: 10px;
}
.room-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, auto));

  gap: 2%;
}
.room-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  background: white;
}
.room-image {
  height: 0;
  padding-bottom: 60%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.room-name {
  flex: 1 1 auto;
  padding-left: 1em;
  padding-right: 1em;
  padding-bottom: 1em;
  flex-grow: 1;
}
.add-room {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 0.3em;
  height: 30px;
  width: 100px;
}
.add-room:hover {
  height: 40px;
  width: 110px;
  background: rgb(133, 132, 132);
  transition: 0.5s;
}
.notice {
  display: flex;
  justify-content: center;
}
.contents {
  background: white;
  width: 70%;
  border: 1px solid #c4c4c4;
}
.content-item {
  font-size: 1.5rem;
  padding-bottom: 1rem;
}
.content-item p {
  font-size: 1rem;
}

.room-settings {
  align-self: flex-end;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 0.5em;
}
.room-settings:hover {
  background: grey;
}
.room-settings:hover i {
  color: white;
}

.page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'header1 header2'
    'room notice';
}
.header1 {
  grid-area: header1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 80px;
  padding: 0 1 rem;
}
.header2 {
  display: flex;
  grid-area: header2;
  align-items: center;
  justify-content: center;
}
.room {
  grid-area: room;
}
.notice {
  grid-area: notice;
}
</style>
