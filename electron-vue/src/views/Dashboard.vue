<template>
  <div>
    <div>
      <ul>
        <li v-for="student in studentList" v-bind:key="student.user">
          <div @click="displayUserChart(student)">
          {{ student.name }}
          </div>
        </li>
      </ul>
    </div>
    <div>
      <div class="CCTButtons">
        <div @click="displaySelectedData('focusPoint')">Focus Point</div>
        <div @click="displaySelectedData('absence')">Absence</div>
        <div @click="displaySelectedData('sleep')">Sleep</div>
        <div @click="displaySelectedData('turnHead')">TurnHead</div>
      </div>
      <chart></chart>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import chart from '../components/Dashboard/Chart.vue';
import bus from '../../utils/bus';

export default {
  name: "Dashboard",
  components: {
    chart,
  },
  computed: {
    ...mapGetters('dashboard', ["studentList"]),
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      type: {
        focusPoint: true,
        absence: false,
        sleep: false,
        turnHead: false,
      },
      displayingUser: [],
    }
  },
  methods: {
    createStudentList() {
      console.log('createStudentList start --------------');
      const options = {
        jwt: this.$store.state.jwt,
        params: {
          class: this.classroomId,
          user: '5f7c1869e6ecde001b3f2f0c',
        },
      }
      this.SetStudentList(options);
      console.log('createStudentList end --------------');
    },
    displayUserChart(student) {
      const index = this.displayingUser.findIndex((user) => user.user === student.user);
      if(index === -1) {
        this.displayingUser.push({user: student.user, name: student.name});
      } else {
        this.displayingUser.splice(index, 1);
      }
      bus.$emit('changeDisplayingData', this.displayingUser, this.type);
    },
    displaySelectedData(dataType) {
      this.type[dataType] = !this.type[dataType];
      bus.$emit('changeDisplayingData', this.displayingUser, this.type);
    },

    ...mapActions('dashboard', ['SetStudentList']),
  },
  created() {
    this.createStudentList();
  },
}
</script>

<style scoped>
.CCTButtons {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.CCTButtons div {
  background: #00d39d;
  color: white;
  margin: 0 10px;
}
.CCTButtons div:focus {
  background: red;
}
</style>