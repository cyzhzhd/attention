<template>
  <div class="wrapper">
    <main-header>
      <div slot="router">
        <div class="router">
          <router-link class="router-item" to="/ClassRoomList">
            교실 목록
          </router-link>
          <a class="router-item" @click="$router.go(-1)">수업 목록</a>
        </div>
      </div>
    </main-header>
    <div class="contents-dashboard">
      <div class="dashboard-sidebar">
        <div class="dashboard-sidebar-title">Dashboard</div>
        <drop-down-box v-bind:size="size">
          <div slot="header">{{ selectedClassName }}</div>
          <div slot="type">
            <div
              class="dropdown-box-contents"
              :class="{
                'dropdown-box-contents-close': !$store.state.dropDownStatus[
                  size
                ],
                'dropdown-box-contents-open': $store.state.dropDownStatus[size],
              }"
            >
              <div
                class="dropdown-list-item"
                @click="setSelectedClassInfo('all', '전체')"
              >
                전체
              </div>
              <div
                class="dropdown-list-item"
                v-for="classInfo in $store.state.classList"
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
              class="type_focusPoint"
              ref="type_focusPoint"
              @click="displaySelectedType('focusPoint')"
            >
              FOCUS POINT
            </div>
            <div
              class="type_attendPer"
              ref="type_attendPer"
              @click="displaySelectedType('attendPer')"
            >
              ATTEND
            </div>
            <div
              class="type_sleepPer"
              ref="type_sleepPer"
              @click="displaySelectedType('sleepPer')"
            >
              SLEEP
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
/* eslint no-underscore-dangle: 0 */
/* eslint-disable no-restricted-syntax */
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
      'datacollection',
    ]),
  },

  watch: {
    datacollection() {
      console.log('datacollection in Dashboard.vue');
    },
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      size: 'medium',
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
      this.$store.dispatch('CHANGE_DROPDOWN_STATUS', this.size);
    },

    callSetStudentList() {
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
      this.CreateCCTFormTime();
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
        console.log(concentrations);
        const payload = {
          classList: this.$store.state.classList,
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
        this.CreateCCTFormTime();

        console.log(this.displayingUserList.length);
        if (!this.displayingUserList.length) {
          const keys = Object.keys(this.studentList);
          if (keys) {
            const { name, user } = this.studentList[keys[0]];
            this.ChangeDisplayingUserList({ name, user });
          }
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
      'CreateCCTFormTime',
      'SetStudentList',
      'ResetVariables',
    ]),
  },
  async created() {
    this.callSetStudentList();

    if (this.selectedClassId === 'all') {
      this.setSelectedClassInfo(this.selectedClassId, '전체');
    } else {
      for (const classInfo of this.$store.state.classList) {
        if (classInfo._id === this.selectedClassId) {
          this.setSelectedClassInfo(this.selectedClassId, classInfo.name);
          break;
        }
      }
    }
    this.$store.dispatch('CHANGE_DROPDOWN_STATUS', this.size);
  },
  mounted() {
    this.setCCTData();
  },

  beforeDestroy() {
    this.ResetVariables();
  },
};
</script>
<style scoped>
@import '../assets/css/Dashboard.css';
</style>
