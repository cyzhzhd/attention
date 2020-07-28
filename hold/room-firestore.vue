<template>
  <div id="rooms">
    <div>
      <button v-on:click="createRoom" v-on:passRoomName="receiveRoomName">create a room</button>
      <h1>list of Rooms</h1>
      <ul>
        <li v-for="room in roomList" :key="room">{{room}}</li>
      </ul>
      <h1>System List</h1>
      <ul>
        <li :key="item.key" v-for="item in testCollection">{{item}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'room',
  data() {
    return {
      roomList: [],
      testCollection: [],
    };
  },
  methods: {
    createRoom() {
      this.$electron.ipcRenderer.send('createRoom');
      console.log('clicked');
    },
    receiveRoomName(name) {
      this.roomList.push(name);
    },
  },
  mounted() {
    console.log('mounted');
    // this.$electron.ipcRenderer.on('newRoom', (event, data) => {
    //   console.log('room got data', data);
    //   this.roomList.push(data);
    //   console.log(this.roomList);
    // });

    console.log('firebase = ', this.$firebase);
    const db = this.$firebase.firestore();
    const roomLists = db.collection('rooms');
    roomLists.onSnapshot((snap) => {
      const testCollection = [];
      snap.forEach((doc) => {
        testCollection.push({ [doc.id]: doc.data() });
      });
      this.testCollection = testCollection;
    });
  },
};
</script>

<style></style>
