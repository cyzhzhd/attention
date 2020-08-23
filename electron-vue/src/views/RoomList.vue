<template>
  <div class="page">
    <header class="header1">
      <h2 class="category">Room List</h2>
      <router-link class="add-room" :to="{ name: 'AddRoom' }" action
        >Add room</router-link
      >
    </header>
    <header class="header2">
      <h2 class="notice-header">
        공지사항
      </h2>
    </header>
    <section class="room">
      <ul class="room-list">
        <li class="room-item" v-for="room in rooms" :key="room.roomId">
          <router-link
            class="room-name"
            :to="{
              name: 'Room',
              params: {
                roomId: room.roomId,
                roomname: room.roomName,
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
            <p>1. 숙제해오기 <br />2. 3번 풀어오기</p>
          </li>
          <li class="content-item">
            영어
            <p>
              1. 2단원 지문 3번 읽기 <br />
              2. 3단원 듣기테스트 2개 듣기 <br />3. 3단원 단어 30문제 테스트
            </p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'roomList',
  data() {
    return {
      uid: this.$user.uid,
      rooms: [],
    };
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
}
.room-image {
  height: 0;
  padding-bottom: 60%;
  background-color: lightgray;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.room-name {
  flex: 1 1 auto;
  padding: 1em;
  background: white;
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
