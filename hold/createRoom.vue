<template>
  <!-- <form v-on:submit.prevent="submitRoomName"> -->
  <form>
    <div>
      "Room"
      <br />
      <div>
        <label for="roomName">room name:</label>
        <input id="roomName" type="text" v-model="roomName" />
        <button v-on:click.prevent="passRoomName">create</button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      roomName: "",
    };
  },
  methods: {
    passRoomName() {
      // this.$emit('passRoomName', this.roomName);
      // this.$electron.ipcRenderer.send('newRoom', this.roomName);

      if (this.roomName !== "") {
        console.log("send data");
        this.$firebase
          .firestore()
          .collection("rooms")
          .add({
            roomName: this.roomName,
            // timestamp: this.$firebase.firestore.FieldValue.serverTimestamp(),
          })
          .catch((error) => {
            console.error("Error writing new message to database", error);
          });
      }
    },
  },
};
</script>

<style></style>
