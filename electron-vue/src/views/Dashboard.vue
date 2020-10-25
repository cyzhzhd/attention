<template>
  <div class="wrapper">
    <side-navigation-panel>
      <div slot="section">
        <router-link class="side-navigation-item" to="/">홈</router-link>
        <router-link class="side-navigation-item" to="/ClassRoomList">교실 목록</router-link>
        <div class="side-navigation-item" @click="$router.go(-1)">수업 목록</div>
      </div>
    </side-navigation-panel>
    <div class="main-panel">
      <div>
        <ul>
          <li v-for="student in studentList" v-bind:key="student.user">
            <div @click="displaySelectedUser(student)">
            {{ student.name }}
            </div>
          </li>
        </ul>
      </div>
      <div>
        <form>
          수업 차시
          <select name="dropdown" v-model="classId">
            <option value="all" selected>전체</option>
            <option v-for="classInfo in classList" :key="classInfo._id" :value="classInfo._id">
              {{ classInfo.name }}
            </option>
          </select>
        </form>
      </div>
      <div>
        <div class="CCTButtons">
          <div @click="displaySelectedType('focusPoint')">Focus Point</div>
          <div @click="displaySelectedType('absence')">Absence</div>
          <div @click="displaySelectedType('sleep')">Sleep</div>
          <div @click="displaySelectedType('turnHead')">TurnHead</div>
        </div>
        <chart v-bind:classId="classId"></chart>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import SideNavigationPanel from '../components/common/SideNavigationPanel.vue';
import chart from '../components/Dashboard/Chart.vue';
import bus from '../../utils/bus';

export default {
  name: "Dashboard",
  components: {
    chart,
    SideNavigationPanel,
  },
  computed: {
    ...mapGetters('dashboard', ["studentList"]),
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classList: [],
      classId: this.$route.params.classId,
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
        },
      }
      this.SetStudentList(options);
      console.log('createStudentList end --------------');
    },
    displaySelectedUser(student) {
      const index = this.displayingUser.findIndex((user) => user.user === student.user);
      if(index === -1) {
        this.displayingUser.push({user: student.user, name: student.name});
      } else {
        this.displayingUser.splice(index, 1);
      }
      bus.$emit('changeDisplayingData', this.displayingUser, this.type);
    },
    displaySelectedType(dataType) {
      this.type[dataType] = !this.type[dataType];
      bus.$emit('changeDisplayingData', this.displayingUser, this.type);
    },

    ...mapActions('dashboard', ['SetStudentList']),
  },
  async created() {
    this.createStudentList();
    const options = {
      class: this.classroomId,
    }
    this.classList = await this.$store.dispatch('FETCH_CLASSLIST', options);
    console.log(this.classList);
    console.log('classId', this.classId);
  },
}
</script>
<style scoped>
@import '../assets/css/Dashboard.css';
</style>