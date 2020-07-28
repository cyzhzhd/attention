<template>
  <div>
    <h2>
      Room List
      <router-link to="/add-room">Add room</router-link>
    </h2>
    <ul>
      <li v-for="room in rooms" :key="room.name">
        <router-link
          :to="{
          name: 'Chat',
          params: {
            nickname: nickname,
            roomid: room.roomKey,
            roomname: room.roomName,
          },
        }"
          action
        >{{ room.roomName }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'BoardList',
  data() {
    return {
      nickname: this.$route.params.nickname,
      rooms: [],
      errors: [],
      db: this.$firebase.firestore(),
    };
  },
  created() {
    const roomLists = this.db.collection('rooms');
    roomLists.onSnapshot((snap) => {
      const tempRooms = [];
      snap.forEach((doc) => {
        const item = doc.data();
        item.roomKey = doc.id;
        tempRooms.push(item);
      });
      this.rooms = tempRooms;
    });
  },
};
</script>

<style>
</style>
