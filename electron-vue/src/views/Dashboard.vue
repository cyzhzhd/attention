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
              <div class="dropdown-list-item" @click="setCCTData('all')">
                전체
              </div>
              <div
                class="dropdown-list-item"
                v-for="classInfo in classList"
                @click="setCCTData(classInfo._id)"
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
          <div class="dashboard-graph">
            <line-chart :chart-data="datacollection"></line-chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import MainHeader from '../components/common/MainHeader.vue';
import DropDownBox from '../components/common/DropDownBox.vue';
import LineChart from '../components/Dashboard/LineChart.vue';

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    MainHeader,
    DropDownBox,
  },
  computed: {
    ...mapGetters('dashboard', [
      'studentList',
      'displayingUserList',
      'classId',
      'datacollection',
      'CCTType',
    ]),
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classList: [],
      DDBClass: 'class',
    };
  },
  methods: {
    setStudentList() {
      console.log('setStudentList start --------------');
      const options = {
        jwt: this.$store.state.jwt,
        params: {
          class: this.classroomId,
        },
      };
      this.SetStudentList(options);
      console.log('setStudentList end --------------');
    },
    displaySelectedUser(student) {
      this.ChangeDisplayingUserList(student);
      // this.DisplayData();
    },
    displaySelectedType(dataType) {
      this.ChangeCCTType(dataType);
      // this.DisplayData();
    },
    async setCCTData(classId) {
      let options;
      if (classId === 'all') {
        options = {
          url: 'class',
          params: { class: this.$route.params.classroomId },
        };
      } else {
        options = { url: 'session', params: { session: classId } };
      }

      const concentrations = await this.$store.dispatch(
        'FETCH_CONCENTRATION',
        options,
      );
      await this.DistributeCCTData(concentrations);
      await this.GetLabels();
      await this.FillStudentList();
      console.log(this.displayingUserList.length);
      if (!this.displayingUserList.length) {
        const keys = Object.keys(this.studentList);
        const { name, user } = this.studentList[keys[0]];
        this.ChangeDisplayingUserList({ name, user });
        console.log(this.displayingUserList);
      }
      this.DisplayData();
    },

    ...mapActions('dashboard', [
      'ChangeClassId',
      'SetStudentList',
      'ChangeDisplayingUserList',
      'ChangeCCTType',
      'ChangeDisplayingUserList',
      'GetLabels',
      'FillStudentList',
      'DistributeCCTData',
      'DisplayData',
    ]),
  },
  async created() {
    this.setStudentList();
    const options = {
      class: this.classroomId,
    };
    this.classList = await this.$store.dispatch('FETCH_CLASSLIST', options);
  },
  // mounted() {
  //   this.ChangeClassId(this.$route.params.classId);
  // },
};
</script>
<style scoped>
@import '../assets/css/Dashboard2.css';
</style>
