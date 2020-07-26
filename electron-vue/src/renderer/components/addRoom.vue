<template>
  <div>
    <h2>
      Add Room
      <!-- <b-link @click="$router.go(-1)">(Room List)</b-link> -->
      <a @click="$router.go(-1)">(back)</a>
    </h2>
    <form @submit.prevent="onSubmit">
      <input id="roomname" v-model.trim="room.roomName" placeholder="Enter Room Name" />
      <button type="submit" variant="primary" :disabled="!room.roomName">Save</button>
    </form>
  </div>
</template>

<script>
// import router from '../router';

export default {
  name: 'AddBoard',
  data() {
    return {
      //   ref: firebase.database().ref('chatrooms/'),
      db: this.$firebase.firestore(),
      room: { roomName: '' },
    };
  },
  methods: {
    onSubmit() {
      //   const newData = this.ref.push();
      //   newData.set({
      //     roomName: this.room.roomName,
      //   });
      //   router.go(-1).catch((error) => {
      //     alert('Error adding document: ', error);
      //   });

      this.db
        .collection('rooms')
        .add({
          roomName: this.room.roomName,
          // timestamp: this.$firebase.firestore.FieldValue.serverTimestamp(),
        })
        .catch((error) => {
          console.error('Error writing new message to database', error);
        });
      this.$router.go(-1);
      // this.$router.go(-1).catch((error) => {
      //   alert('Error adding document: ', error);
      // });
    },
  },
};
</script>

<style>
</style>
