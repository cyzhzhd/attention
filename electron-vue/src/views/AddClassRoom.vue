<template>
  <div>
    <h2>
      Add Room
      <a @click="$router.go(-1)">(back)</a>
    </h2>
    <form @submit.prevent="createRoom" v-if="this.$store.state.user.isTeacher">
      방 이름 <input v-model.trim="roomName" placeholder="Enter Room Name" />
      <form>
        과목 태그
        <select name="dropdown" v-model="tags">
          <option value="국어" selected>국어</option>
          <option value="영어">영어</option>
          <option value="수학">수학</option>
          <option value="사회">사회</option>
          <option value="과학">과학</option>
          <option value="기타">기타</option>
        </select>
      </form>
      <form>
        수업 유형
        <select name="dropdown2" v-model="classType">
          <option value="public" selected>public</option>
          <option value="private">private</option>
        </select>
      </form>
      <button
        class="create-room-button"
        type="submit"
        variant="primary"
        :disabled="!roomName"
      >
        Create Room
      </button>
    </form>
    <form @submit.prevent="addClassRoom" v-else>
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
      tags: '국어',
      roomName: '',
      classType: 'public',
      roomCodeAdd: '',
    };
  },
  methods: {
    async createRoom() {
      const options = {
        name: this.roomName,
        tags: this.tags,
        classType: this.classType,
      };
      await this.$store.dispatch('CREATE_CLASSROOM', options)
      this.$router.go(-1);
    },

    async addClassRoom() {
      const options = {
        class: this.roomCodeAdd,
      };
      await this.$store.dispatch('ADD_CLASSROOM', options)
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.create-room-button {
  background-color: aquamarine;
  color: white;
}
</style>
