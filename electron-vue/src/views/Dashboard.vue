<template>
  <div class="wrapper">
    <main-header></main-header>
    <div class="contents-dashboard">
      <div class="dashboard-sidebar">
        <div class="dashboard-sidebar-title">Dashboard</div>
        <drop-down-box v-bind:type="DDBClass">
          <div slot="header">전체</div>
          <div slot="type">
            <div
              id="week-dropdown"
              class="dropdown-box-contents dropdown-box-contents-close"
            >
              <div
                class="dropdown-list-item"
                v-for="classInfo in classList"
                @click="changeClassId(classInfo._id)"
                :key="classInfo._id"
                :value="classInfo._id"
              >
                {{ classInfo.name }}
              </div>
            </div>
          </div>
        </drop-down-box>
        <div class="search-button-wrapper">
          <div class="search-button">찾기</div>
        </div>
      </div>

      <div class="dashboard-contents">
        <ul class="user-list-wrapper">
          <li
            class="user-item"
            v-for="student in studentList"
            v-bind:key="student.user"
            @click="displaySelectedUser(student)"
          >
            <img
              src="../assets/img/DashBoard/userprofile-dashboard.svg"
              class="user-profile"
            />
            <div class="username">
              {{ student.name }}
            </div>
          </li>
        </ul>
        <div class="dashboard">
          <div class="dashboard-filter-list">
            <div
              class="dashboard-filter"
              @click="displaySelectedType('focusPoint')"
            >
              Focus Point
            </div>
            <div
              class="dashboard-filter"
              @click="displaySelectedType('absence')"
            >
              Absence
            </div>
            <div class="dashboard-filter" @click="displaySelectedType('sleep')">
              Sleep
            </div>
            <div
              class="dashboard-filter"
              @click="displaySelectedType('turnHead')"
            >
              TurnHead
            </div>
          </div>
          <chart class="dashboard-graph" v-bind:classId="classId"></chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import MainHeader from '../components/common/MainHeader.vue';
import DropDownBox from '../components/common/DropDownBox.vue';
import chart from '../components/Dashboard/Chart.vue';
import bus from '../../utils/bus';

export default {
  name: 'Dashboard',
  components: {
    chart,
    MainHeader,
    DropDownBox,
  },
  computed: {
    ...mapGetters('dashboard', ['studentList']),
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classList: [],
      classId: this.$route.params.classId,
      DDBClass: 'class',
      type: {
        focusPoint: true,
        absence: false,
        sleep: false,
        turnHead: false,
      },
      displayingUser: [],
    };
  },
  methods: {
    changeClassId(classId) {
      this.classId = classId;
    },
    createStudentList() {
      console.log('createStudentList start --------------');
      const options = {
        jwt: this.$store.state.jwt,
        params: {
          class: this.classroomId,
        },
      };
      this.SetStudentList(options);
      console.log('createStudentList end --------------');
    },
    displaySelectedUser(student) {
      const index = this.displayingUser.findIndex(
        (user) => user.user === student.user,
      );
      if (index === -1) {
        this.displayingUser.push({ user: student.user, name: student.name });
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
    };
    this.classList = await this.$store.dispatch('FETCH_CLASSLIST', options);
    console.log(this.classList);
    console.log('classId', this.classId);
  },
};
</script>
<style scoped>
@import '../assets/css/Dashboard2.css';
</style>
