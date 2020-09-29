<template>
  <div>
    <h2>
      Add Room
      <a @click="$router.go(-1)">(back)</a>
    </h2>
    <form @submit.prevent="createRoom">
      <input v-model.trim="roomNameCreate" placeholder="Enter Room Name" />
      <button type="submit" variant="primary" :disabled="!roomNameCreate">
        Create Room
      </button>
    </form>
    <form @submit.prevent="addFavRoom">
      <input v-model.trim="roomCodeAdd" placeholder="Enter Room code" />
      <button type="submit" variant="primary" :disabled="!roomCodeAdd">
        Add Room
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AddBoard',
  data() {
    return {
      roomNameCreate: '',
      roomCodeAdd: '',
    };
  },
  methods: {
    createRoom() {
      const options = {
        roomName: this.roomNameCreate,
        userName: this.$user.displayName,
        host: this.$user.uid,
      };
      this.$http.post('/api/firebase/createRoom', options);
      this.$router.go(-1);
    },

    addFavRoom() {
      const options = {
        uid: this.$user.uid,
        userName: this.$user.displayName,
        roomId: this.roomCodeAdd,
      };
      this.$http.post('/api/firebase/addFavRoom', options);

      this.$router.go(-1);
    },
  },
};
</script>

<style></style>
