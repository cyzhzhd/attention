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
          <!-- <ul class="user-list-wrapper"> -->
          <li
            class="user-item"
            v-for="student in studentList"
            v-bind:key="student.user"
            @click="displaySelectedUser(student)"
          >
            <img
              src="../assets/img/DashBoard/userprofile-dashboard.svg"
              class="user-profile"
              v-bind:id="student.user"
            />
            <div class="username">
              {{ student.name }}
            </div>
          </li>
        </ul>
        <div class="dashboard">
          <div class="dashboard-filter-list">
            <div
              class="dataType-selected"
              ref="type_focusPoint"
              @click="displaySelectedType('focusPoint')"
            >
              focus point
            </div>
            <div ref="type_attendPer" @click="displaySelectedType('attendPer')">
              attend
            </div>
            <div ref="type_sleepPer" @click="displaySelectedType('sleepPer')">
              sleep
            </div>
          </div>
          <div class="dashboard-graph">
            <line-chart
              :chart-data="datacollection"
              :options="options"
            ></line-chart>
          </div>
          <div class="time-interval" v-if="!displayingAllClass">
            <div ref="interval_1" @click="displayWithTimeInterval(1)">1분</div>
            <div
              ref="interval_5"
              class="interval-selected"
              @click="displayWithTimeInterval(5)"
            >
              5분
            </div>
            <div ref="interval_10" @click="displayWithTimeInterval(10)">
              10분
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
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
      selectedType: {
        focusPoint: true,
        attendPer: false,
        sleepPer: false,
      },
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
      if (this.selectedType[dataType]) {
        this.selectedType[dataType] = !this.selectedType[dataType];
        this.$refs[`type_${dataType}`].classList.remove('dataType-selected');
      } else {
        this.selectedType[dataType] = !this.selectedType[dataType];
        this.$refs[`type_${dataType}`].classList.add('dataType-selected');
      }
      this.ChangeCCTType(dataType);
      this.DisplayData(this.selectedClassName);
    },
    displayWithTimeInterval(interval) {
      [1, 5, 10].forEach((num) =>
        this.$refs[`interval_${num}`].classList.remove('interval-selected'),
      );
      this.$refs[`interval_${interval}`].classList.add('interval-selected');
      this.ChangeInterval(interval);
      this.CreateLabels();
      this.CreateCCTForm();
      this.DisplayData();
    },
    async setCCTData() {
      console.log('setCCTData start --------------');
      let options;
      if (this.selectedClassId === 'all') {
        this.displayingAllClass = true;
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
      } else {
        this.displayingAllClass = false;
        options = { url: 'session', params: { session: this.selectedClassId } };

        const concentrations = await this.$store.dispatch(
          'FETCH_CONCENTRATION',
          options,
        );
        this.DistributeCCTData(concentrations);
        this.CreateLabels();
        this.CreateCCTForm();

        console.log(this.displayingUserList.length);
        if (!this.displayingUserList.length) {
          const keys = Object.keys(this.studentList);
          const { name, user } = this.studentList[keys[0]];
          this.ChangeDisplayingUserList({ name, user });
          console.log(this.displayingUserList);
        }
        this.DisplayData();
      }
      console.log('setCCTData end --------------');
    },

    ...mapActions('dashboard', [
      'ChangeDisplayingUserList',
      'ChangeCCTType',
      'ChangeInterval',
      'CreateLabels',
      'DistributeCCTData',
      'DisplayData',
      'DrawChartAllClass',
      'CreateCCTForm',
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
    if (this.selectedClassId === 'all') {
      this.setSelectedClassInfo(this.selectedClassId, '전체');
    } else {
      /* eslint no-underscore-dangle: "error" */
      const index = this.classList.findIndex((classInfo) => {
        const { _id } = classInfo;
        return _id === this.selectedClassId;
      });
      this.setSelectedClassInfo(
        this.selectedClassId,
        this.classList[index].name,
      );
    }
    this.setCCTData();
  },
};
</script>
<style scoped>
@import '../assets/css/Dashboard2.css';
</style>
