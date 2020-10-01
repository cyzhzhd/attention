<template>
  <div>
    <h2>
      Add Room
      <a @click="$router.go(-1)">(back)</a>
    </h2>
    <form @submit.prevent="createRoom">
      <input v-model.trim="roomName" placeholder="Enter Room Name" />
      <input v-model.trim="tags" placeholder="Enter tags" />
      <input v-model.trim="classType" placeholder="choose class type" />
      <button type="submit" variant="primary" :disabled="!roomName">
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
      tags: '',
      roomName: '',
      classType: '',
      roomCodeAdd: '',
    };
  },
  methods: {
    createRoom() {
      const options = {
        name: this.roomName,
        tags: this.tags,
        classType: this.classType,
      };
      const headers = {
        headers: {
          Authorization: `Bearer ${this.$jwt}`,
        },
      };
      this.$http.post('/api/class', options, headers);
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
