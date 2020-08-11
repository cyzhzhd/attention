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
      nickname: this.$route.params.nickname,
      db: this.$firebase.firestore(),
      room: { roomName: '' },
    };
  },
  methods: {
    onSubmit() {
      const options = {
        roomName: this.room.roomName,
        host: this.nickname,
      };
      this.$http.post('/api/firebase/roomList', options);

      this.$router.go(-1);
    },
  },
};
</script>

<style></style>
