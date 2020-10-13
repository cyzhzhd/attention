<template>
  <div>
    <div>
      <ul>
        <li v-for="student in studentList" v-bind:key="student.user">
          {{ student.user }}
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
    }
  },
  methods: {
    createStudentList() {
      console.log('createStudentList start --------------');
      this.$store.state.classroom.some(classroom => {
      const { _id } = classroom;
      if (_id === this.classroomId) {
        this.SetStudentList(classroom);
        return true;
      }
      return false;
      });
      console.log('createStudentList end --------------');
    },
    displaySelectedData(dataType) {
      this.type[dataType] = !this.type[dataType];
      bus.$emit('changeDisplayingData', this.type);
    },

    ...mapActions('dashboard', ['SetStudentList']),
  },
  created() {
    this.createStudentList();
  },
  mounted() {
    bus.$emit('changeDisplayingData', this.type);
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