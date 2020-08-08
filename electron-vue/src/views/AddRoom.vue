<template>
  <div>
    <h2>
      Add Room
      <!-- <b-link @click="$router.go(-1)">(Room List)</b-link> -->
      <a @click="$router.go(-1)">(back)</a>
    </h2>
    <form @submit.prevent="onSubmit">
      <input
        id="roomname"
        v-model.trim="room.roomName"
        placeholder="Enter Room Name"
      />
      <button type="submit" variant="primary" :disabled="!room.roomName">
        Save
      </button>
    </form>
  </div>
</template>

<script>
// import router from '../router';

export default {
  name: 'AddBoard',
  data() {
    return {
      db: this.$firebase.firestore(),
      room: { roomName: '' },
    };
  },
  methods: {
    onSubmit() {
      this.db
        .collection('rooms')
        .add({
          roomName: this.room.roomName,
          // timestamp: this.$firebase.firestore.FieldValue.serverTimestamp(),
        })
        .catch(error => {
          console.error('Error writing new message to database', error);
        });
      this.$router.go(-1);
    },
  },
};
</script>

<style></style>
