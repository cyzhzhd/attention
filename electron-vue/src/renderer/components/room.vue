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
    // console.log('in the room', this.$firebase.database());

    // const db = this.$firebase.firestore();
    // const roomLists = db.collection('rooms');
    // roomLists.onSnapshot((snap) => {
    //   const testCollection = [];
    //   snap.forEach((doc) => {
    //     testCollection.push({ [doc.id]: doc.data() });
    //   });
    //   this.testCollection = testCollection;
    // });

    const roomLists = this.db.collection('rooms');
    roomLists.onSnapshot((snap) => {
      const tempRooms = [];
      snap.forEach((doc) => {
        const item = doc.data();
        item.roomKey = doc.id;
        tempRooms.push(item);
        console.log('doc id');
        console.log(item);
      });
      this.rooms = tempRooms;
    });

    // this.db.on('value', (snapshot) => {
    //   this.rooms = [];
    //   snapshot.forEach((doc) => {
    //     const item = doc.val();
    //     item.key = doc.key;
    //     this.rooms.push(item);
    //   });
    // });
  },
};
</script>

<style>
</style>
