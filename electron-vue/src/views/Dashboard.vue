<template>
  <div class="wrapper">
    <main-header></main-header>
    <div class="contents-dashboard">
      <div class="dashboard-sidebar">
        <div class="dashboard-sidebar-title">Dashboard</div>
        <drop-down-box v-bind:type="weekDropdown">
          <div slot="header">{{ selectedClassName }}</div>
          <div slot="type">
            <div
              id="week-dropdown"
              class="dropdown-box-contents dropdown-box-contents-close"
            >
              <div
                class="dropdown-list-item"
                @click="setSelectedClassInfo('all', '전체')"
              >
                전체
              </div>
              <div
                class="dropdown-list-item"
                v-for="classInfo in classList"
                @click="setSelectedClassInfo(classInfo._id, classInfo.name)"
                :key="classInfo._id"
                :value="classInfo._id"
              >
                {{ classInfo.name }}
              </div>
            </div>
          </div>
        </drop-down-box>
        <div class="search-button-wrapper">
          <div class="search-button" @click="setCCTData()">찾기</div>
        </div>
      </div>

      <div class="dashboard-contents">
        <ul class="user-list-wrapper" v-if="!displayingAllClass">
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
            <div @click="displaySelectedType('focusPoint')">focus point</div>
            <div @click="displaySelectedType('attendPer')">attend</div>
            <div @click="displaySelectedType('sleepPer')">sleep</div>
          </div>
          <div class="dashboard-graph">
            <div class="small">
              <line-chart :chart-data="datacollection" :options="{responsive: true, maintainAspectRatio: false}"></line-chart>
            </div>
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
import bus from '../../utils/bus';

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
      'datacollection',
    ]),
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classList: [],
      weekDropdown: 'weekDropdown',
      selectedClassName: '전체',
      selectedClassId: this.$route.params.classId,
      displayingAllClass: true,
    };
  },
  methods: {
    setSelectedClassInfo(classId, className) {
      this.selectedClassName = className;
      this.selectedClassId = classId;
      bus.$emit('dropDownBox:onClickDropDown', 'weekDropdown');
    },
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
      this.DisplayData();
    },
    displaySelectedType(dataType) {
      this.ChangeCCTType(dataType);
      this.DisplayData(this.selectedClassName);
    },
    async setCCTData() {
      console.log('setCCTData start --------------');
      let options;
      if (this.selectedClassId === 'all') {
        options = {
          url: 'class',
          params: { class: this.$route.params.classroomId },
        };
        const concentrations = await this.$store.dispatch(
          'FETCH_CONCENTRATION',
          options,
        );
        const payload = {
          classList: this.classList,
          CCTData: concentrations,
        };
        this.DrawChartAllClass(payload);
        this.displayingAllClass = true;
      } else {
        options = { url: 'session', params: { session: this.selectedClassId } };

        const concentrations = await this.$store.dispatch(
          'FETCH_CONCENTRATION',
          options,
        );
        this.DistributeCCTData(concentrations);
        this.CreateLabels();
        this.FillStudentList();
        console.log(this.displayingUserList.length);
        if (!this.displayingUserList.length) {
          const keys = Object.keys(this.studentList);
          const { name, user } = this.studentList[keys[0]];
          this.ChangeDisplayingUserList({ name, user });
          console.log(this.displayingUserList);
        }
        this.DisplayData();

        this.displayingAllClass = false;
        console.log('setCCTData end --------------');
      }
    },

    ...mapActions('dashboard', [
      'ChangeDisplayingUserList',
      'ChangeCCTType',
      'CreateLabels',
      'DistributeCCTData',
      'DisplayData',
      'DrawChartAllClass',
      'FillStudentList',
      'SetStudentList',
    ]),
  },
  async created() {
    this.setStudentList();
    const options = {
      class: this.classroomId,
    };
    this.classList = await this.$store.dispatch('FETCH_CLASSLIST', options);
  },
  mounted() {
    if(this.selectedClassId === "all"){
      this.setSelectedClassInfo(this.selectedClassId, '전체');
    } else {
      /* eslint no-underscore-dangle: "error" */
      const index = this.classList.findIndex(classInfo => {
        const {_id} = classInfo;
        return _id === this.selectedClassId;
      });
      this.setSelectedClassInfo(this.selectedClassId, this.classList[index].name);
    }
    this.setCCTData();
  },
};
</script>
<style scoped>
@import '../assets/css/Dashboard2.css';
</style>
