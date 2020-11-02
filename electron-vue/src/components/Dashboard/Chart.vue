<template>
  <div class="small">
    <line-chart :chart-data="datacollection"></line-chart>
  </div>
</template>

<script>
/* eslint no-param-reassign: "error" */
import { mapGetters, mapActions } from 'vuex';
import LineChart from './LineChart.vue';
import bus from '../../../utils/bus';

export default {
  name: 'Chart',
  watch: {
    '$store.state.dashboard.classId': async (val, oldVal) => {
      // immediate: true,
      // async handler(val, oldVal) {
      console.log('classDataHandler', val, oldVal);
      console.log(this.distributeCCTData);
      if (val === 'all') {
        const options = { class: this.$route.params.classroomId };
        await this.distributeCCTData('class', options);
      } else {
        const options = { session: val };
        await this.distributeCCTData('session', options);
      }
      this.getLabels();
      this.fillStudentList();
      console.log(this.displayingUserList.length);
      if (!this.displayingUserList.length) {
        const keys = Object.keys(this.studentList);
        const { name, user } = this.studentList[keys[0]];
        this.ChangeDisplayingUserList({ name, user });
        console.log(this.displayingUserList);
      }
      this.displayData();
      // },
    },
  },
  components: {
    LineChart,
  },
  computed: {
    ...mapGetters('dashboard', [
      'classId',
      'studentList',
      'displayingUserList',
      'CCTType',
    ]),
  },
  data() {
    return {
      datacollection: null,
      timeRange: [],
      data: {},
      hasCalculated: {},
    };
  },
  methods: {
    ...mapActions('dashboard', ['ChangeDisplayingUserList']),
    resetData() {
      const keys = Object.keys(this.studentList);
      if (keys) {
        keys.forEach((key) => {
          this.studentList[key].cctTotal = [];
          this.studentList[key].cctTime = [];
          console.log(this.studentList[key]);
        });
      }
      this.data = {};
      this.hasCalculated = {};
    },

    async distributeCCTData(url, params) {
      console.log('distributeCCTData start --------------');
      console.log(url, params);
      this.resetData();

      const options = {
        url,
        params,
      };
      const concentrations = await this.$store.dispatch(
        'FETCH_CONCENTRATION',
        options,
      );
      console.log(concentrations);
      concentrations.forEach((concentration) => {
        this.studentList[concentration.user].cctTotal.push(concentration);
      });
      console.log(this.studentList);
      console.log('distributeCCTData end --------------');
    },
    compare(a, b) {
      return a.valueOf() && b.valueOf() ? (a > b) - (a < b) : NaN;
    },
    addMinutes(date, minutes) {
      return new Date(date.getTime() + minutes * 60000);
    },
    makeRange(sTime, eTime) {
      const labels = [];
      let time = sTime;
      while (this.compare(time, eTime) < 1) {
        const splits = time.toString().split(' ');
        labels.push(splits[4]);
        time = this.addMinutes(time, 1);
      }
      return labels;
    },
    getTimeSpan() {
      let startTime = new Date('2050-10-09T06:18:33.674Z');
      let endTime = new Date('2010-10-09T06:18:33.674Z');
      const keys = Object.keys(this.studentList);
      keys.forEach((key) => {
        const { cctTotal } = this.studentList[key];
        const length = cctTotal.length - 1;
        if (cctTotal[0]) {
          const firstData = new Date(cctTotal[0].date);
          const lastData = new Date(cctTotal[length].date);
          startTime =
            this.compare(startTime, firstData) === -1 ? startTime : firstData;
          endTime = this.compare(endTime, lastData) === 1 ? endTime : lastData;
        }
      });
      startTime.setSeconds(0, 0);
      endTime.setSeconds(0, 0);
      return { startTime, endTime };
    },
    fillStudentList() {
      console.log('fillStudentList start --------------');
      const keys = Object.keys(this.studentList);
      this.timeRange.forEach((label) => {
        keys.forEach((key) => {
          this.studentList[key].cctTime.push({
            time: label,
            concentrationArr: [],
            concentrationMean: {},
          });
        });
      });
      console.log('fillStudentList end --------------');
    },
    getLabels() {
      console.log('getLabels start --------------');
      const { startTime, endTime } = this.getTimeSpan();
      const labels = this.makeRange(startTime, endTime);
      this.timeRange = labels;
      console.log('getLabels end --------------');
    },
    divideDataPerMinute(student) {
      student.cctTotal.forEach((cctTotal) => {
        const date = new Date(cctTotal.date);
        date.setSeconds(0, 0);
        const time = date.toString().split(' ')[4];
        student.cctTime.forEach((cctTime) => {
          if (cctTime.time === time) {
            cctTime.concentrationArr.push(cctTotal.status);
          }
        });
      });
    },
    calculateAverage(student) {
      this.data[student.user] = {
        focusPoint: [],
        absence: [],
        sleep: [],
        turnHead: [],
      };
      student.cctTime.forEach((cctTime) => {
        const cctArrLength = cctTime.concentrationArr.length || 1;
        let absenceTTL = 0;
        let focusPointTTL = 0;
        let sleepTTL = 0;
        let turnHeadTTL = 0;
        cctTime.concentrationArr.forEach((cctArr) => {
          absenceTTL += cctArr.absence;
          focusPointTTL += cctArr.focusPoint;
          sleepTTL += cctArr.sleep;
          turnHeadTTL += cctArr.turnHead;
        });
        const focusPointMean = focusPointTTL / cctArrLength;
        const absenceMean = (absenceTTL / cctArrLength) * 100;
        const sleepMean = (sleepTTL / cctArrLength) * 100;
        const turnHeadMean = (turnHeadTTL / cctArrLength) * 100;
        cctTime.concentrationMean = {
          absence: absenceMean,
          focusPoint: focusPointMean,
          sleep: sleepMean,
          turnHead: turnHeadMean,
        };
        this.data[student.user].focusPoint.push(focusPointMean);
        this.data[student.user].absence.push(absenceMean);
        this.data[student.user].sleep.push(sleepMean);
        this.data[student.user].turnHead.push(turnHeadMean);
      });
    },
    calculateCCTData() {
      console.log('calculateCCTData start --------------');
      console.log();
      this.displayingUserList.forEach((userInfo) => {
        const { user } = userInfo;
        console.log(user);
        console.log(this.hasCalculated[user]);
        console.log(!this.hasCalculated[user]);
        if (!this.hasCalculated[user]) {
          const student = this.studentList[user];
          console.log('calculating -------------------', student);
          this.divideDataPerMinute(student);
          this.calculateAverage(student);
          this.hasCalculated[user] = true;
        }
      });
      console.log('calculateCCTData end --------------');
    },

    chooseColor(key) {
      if (key === 'absence') return 'rgba(255, 255, 0, 1)';
      if (key === 'focusPoint') return 'rgba(255, 0, 0, 1)';
      if (key === 'sleep') return 'rgba(0, 255, 0, 1)';
      return 'rgba(0, 0, 255, 1)';
    },
    addDataSet(userInfo, key) {
      const { user, name } = userInfo;
      console.log(key);
      console.log(this.data[user]);
      return {
        label: `${name} - ${key}`,
        borderColor: this.chooseColor(key),
        data: this.data[user][key],
        fill: false,
      };
    },
    drawChart() {
      console.log('drawChart start --------------');
      this.datacollection = {
        labels: this.timeRange,
        datasets: [],
        options: {
          // responsive: false,
          responsive: true,
          maintainAspectRatio: false,
        },
      };
      this.displayingUserList.forEach((userInfo) => {
        const keys = Object.keys(this.CCTType);
        keys.forEach((key) => {
          if (this.CCTType[key]) {
            this.datacollection.datasets.push(this.addDataSet(userInfo, key));
          }
        });
      });
      console.log('drawChart end --------------');
    },
    displayData() {
      this.calculateCCTData();
      this.drawChart();
    },
  },
  async mounted() {
    bus.$on('changeDisplayingData', () => {
      this.displayData();
    });
  },

  beforeDestroy() {
    bus.$off('changeDisplayingData');
  },
};
</script>

<style scoped>
.small {
  border: 1px solid black;
  /* position: relative; */
  height: 52vh;
  overflow-x: auto;
}
</style>
