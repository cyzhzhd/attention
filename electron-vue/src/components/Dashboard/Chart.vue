<template>
  <div class="small">
    <line-chart :chart-data="datacollection"></line-chart>
    <button @click="drawChart()">Show</button>
  </div>
</template>

<script>
/* eslint no-param-reassign: "error" */
import { mapGetters } from 'vuex';
import LineChart from './LineChart.vue';
import bus from '../../../utils/bus';

export default {
  name: "Chart",
  components: {
    LineChart,
  },
  computed: {
    ...mapGetters('dashboard', ["studentList"]),
  },
  data () {
    return {
      datacollection: null,
      timeRange: [],
      data: {},
      hasCalculated: {},
    }
  },
  methods: {
    async distributeCCTData() {
      console.log('distributeCCTData start --------------');
      console.log(this.studentList);
      const options = {
        url: 'class',
        params: { class: this.$route.params.classroomId},
      }
      const concentrations = await this.$store.dispatch('FETCH_CONCENTRATION', options);
      concentrations.forEach(concentration => {
          this.studentList[concentration.user].cctTotal.push(concentration);
      })
      console.log('distributeCCTData end --------------');
    },
    compare(a,b) {
      return a.valueOf() && b.valueOf() ? (a>b)-(a<b) : NaN;
    },
    addMinutes(date, minutes) {
      return new Date(date.getTime() + minutes * 60000);
    },
    makeRange(sTime, eTime) {
      const labels = [];
      let time = sTime;
      while(this.compare(time, eTime) < 1) {
        const splits = time.toString().split(' ');
        labels.push(splits[4]);
        time = this.addMinutes(time, 1);
      }
      return labels;
    },
    getTimeSpan() {
      let startTime = new Date("2050-10-09T06:18:33.674Z");
      let endTime = new Date("2010-10-09T06:18:33.674Z");
     const keys = Object.keys(this.studentList);
      keys.forEach(key => {
        const { cctTotal } = this.studentList[key];
        const length = cctTotal.length - 1;
        if(cctTotal[0]) {
          const firstData = new Date(cctTotal[0].date);
          const lastData = new Date(cctTotal[length].date);
          startTime = this.compare(startTime, firstData) === -1 ? startTime : firstData;
          endTime = this.compare(endTime, lastData) === 1 ? endTime : lastData;
        }
      })
      startTime.setSeconds(0, 0);
      endTime.setSeconds(0, 0);
      return {startTime, endTime};
    },
    fillStudentList() {
      console.log('fillStudentList start --------------');
      const keys = Object.keys(this.studentList);
      this.timeRange.forEach(label => {
          keys.forEach(key => {
              this.studentList[key].cctTime.push({
                  time: label,
                  concentrationArr: [],
                  concentrationMean: {},
          })
        })
      });

      // bus.$emit("ready-to-draw-chart");
      console.log('fillStudentList end --------------');
    },
    getLabels() {
      console.log('getLabels start --------------');
      const { startTime, endTime } = this.getTimeSpan();
      const labels = this.makeRange(startTime, endTime);
      this.timeRange = labels;
      console.log('getLabels end --------------');
    //   return labels;
    },
    divideDataPerMinute(student) {
      student.cctTotal.forEach(cctTotal => {
        const date = new Date(cctTotal.date);
        date.setSeconds(0, 0)
        const time = date.toString().split(' ')[4];
        // console.log(time);
        student.cctTime.forEach(cctTime => {
          if(cctTime.time === time) {
            cctTime.concentrationArr.push(cctTotal.status);
          }
        })
      })
    },
    calculateAverage(student) {
      this.data[student.user] = {
          focusPoint: [],
          absence: [],
          sleep: [],
          turnHead: [],
      };
      student.cctTime.forEach(cctTime => {
        const cctArrLength = cctTime.concentrationArr.length || 1;
        let absenceTTL = 0;
        let focusPointTTL = 0;
        let sleepTTL = 0;
        let turnHeadTTL = 0;
        cctTime.concentrationArr.forEach(cctArr => {
          absenceTTL += cctArr.absence;
          focusPointTTL += cctArr.focusPoint;
          sleepTTL += cctArr.sleep;
          turnHeadTTL += cctArr.turnHead;
        })
        const focusPointMean =  focusPointTTL / cctArrLength;
        const absenceMean =  absenceTTL / cctArrLength * 100;
        const sleepMean =  sleepTTL / cctArrLength * 100;
        const turnHeadMean =  turnHeadTTL / cctArrLength * 100;
        cctTime.concentrationMean = {
          absence: absenceMean,
          focusPoint: focusPointMean,
          sleep: sleepMean,
          turnHead: turnHeadMean,
        }
        this.data[student.user].focusPoint.push(focusPointMean);
        this.data[student.user].absence.push(absenceMean);
        this.data[student.user].sleep.push(sleepMean);
        this.data[student.user].turnHead.push(turnHeadMean);
      })
    },
    calculateCCTData(userList) {
      console.log('calculateCCTData start --------------');
      userList.forEach(userInfo => {
        const { user } = userInfo;
        console.log(user);
        console.log(this.hasCalculated[user]);
        console.log(!this.hasCalculated[user]);
        if(!this.hasCalculated[user]) {
          const student = this.studentList[user];
          console.log('calculating -------------------', student);
          this.divideDataPerMinute(student);
          this.calculateAverage(student);    
          this.hasCalculated[user] = true;
        }
      })
      // const id = '5f7fef73b14f4400111665c4';
      // const student = this.studentList[id];
      console.log('calculateCCTData end --------------');
    },

    chooseColor(key) {
        if(key === 'absence') return 'rgba(255, 255, 0, 1)';
        if(key === 'focusPoint') return 'rgba(255, 0, 0, 1)';
        if(key === 'sleep') return 'rgba(0, 255, 0, 1)';
        return 'rgba(0, 0, 255, 1)';
    },
    addDataSet(userInfo, key) {
      const { user, name } = userInfo;
      console.log(key);
      // const id = '5f7fef73b14f4400111665c4';
      console.log(this.data[user]);
        return {
            label: `${name} - ${key}`,
            borderColor: this.chooseColor(key),
            data: this.data[user][key],
            fill: false,
        }
    },
    drawChart(userList, type) {
      console.log('drawChart start --------------');
      console.log(type);
      console.log(userList);
      this.datacollection = {
        labels: this.timeRange,
        datasets: [
        ],
      };
      userList.forEach(userInfo => {
        const keys = Object.keys(type);
        keys.forEach(key => {
            if(type[key]) {
                this.datacollection.datasets.push(this.addDataSet(userInfo, key));
            }
        })
      })
      console.log('drawChart end --------------');
    },
    displayData(userList, type) {
      this.calculateCCTData(userList);
      this.drawChart(userList, type);
    },
    displayDataByUser(userList, type) {
      this.calculateCCTData(userList);
      this.drawChart(userList, type);
    }
  },
  async mounted() {
    bus.$on('changeDisplayingData', (userList, type) => {
      console.log('changeDisplayingData', type);
      this.displayData(userList, type);
    });
    await this.distributeCCTData();
    this.getLabels();
    this.fillStudentList();
  },
      
  beforeDestroy() {
    bus.$off('changeDisplayingData');
  },
}
</script>

<style>
  .small {
    max-width: 600px;
    margin: 150px auto;
  }
</style>