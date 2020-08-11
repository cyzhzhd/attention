<template>
  <div>
    <h2>
      Room List
      <router-link
        :to="{
          name: 'AddRoom',
          params: {
            nickname,
          },
        }"
        action
        >Add room</router-link
      >
    </h2>
    <ul>
      <li v-for="room in rooms" :key="room.roomId">
        <router-link
          :to="{
            name: 'Room',
            params: {
              nickname: nickname,
              roomId: room.roomId,
              roomname: room.roomName,
            },
          }"
          action
          >{{ room.roomName }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'roomList',
  data() {
    return {
      nickname: this.$route.params.nickname,
      rooms: [],
    };
  },
  created() {
    this.$http.get('/api/firebase/roomList').then(response => {
      // this.rooms = response.data;
      const objectToArray = Object.entries(response.data);
      objectToArray.forEach(([key, value]) => {
        const newObject = {
          roomId: key,
          host: value.host,
          roomName: value.roomName,
        };
        this.rooms.push(newObject);
      });
    });
  },
};
</script>

<style></style>
