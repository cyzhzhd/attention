<template>
  <div>
    <h2>
      Add Class
      <a @click="$router.go(-1)">(back)</a>
    </h2>
    <form @submit.prevent="createSession">
      <input v-model.trim="sessionName" placeholder="Enter session Name" />
      <input type="datetime-local" v-model="startTime" />
      <input type="datetime-local" v-model="endTime" />
      <button type="submit" variant="primary" :disabled="!sessionName">
        Create Session
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AddBoard',
  data() {
    return {
      sessionName: '',
      startTime: '',
      endTime: '',
    };
  },
  methods: {
    createSession() {
      const options = {
        name: this.sessionName,
        class: this.$route.params.classroomId,
        scheduledStartTime: `${this.startTime}:00+09:00`,
        scheduledEndTime: `${this.endTime}:00+09:00`,
      };
      const headers = {
        headers: {
          Authorization: `Bearer ${this.$jwt}`,
        },
      };
      console.log(options);
      this.$http.post(
        'https://be.swm183.com:3000/api/session',
        options,
        headers,
      );
      this.$router.go(-1);
    },
  },
};
</script>

<style></style>
