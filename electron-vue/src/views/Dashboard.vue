<template>
  <div>
    <div>
      <ul>
        <li v-for="student in studentList" v-bind:key="student.user">
          {{ student.user }}
        </li>
      </ul>
    </div>
    <div class="small">
      <line-chart :chart-data="datacollection"></line-chart>
      <button @click="drawChart()">Randomize</button>
    </div>
  </div>
</template>

<script>
/* eslint no-param-reassign: "error" */
  import LineChart from '../components/Dashboard/LineChart.vue';

  export default {
    name: "Dashboard",
    components: {
      LineChart,
    },
    data () {
      return {
        classroomId: this.$route.params.classroomId,
        classInfo: null,
        datacollection: null,
        studentList: {},
        absence: [],
        focusPoint: [],
        sleep: [],
        turnHead: [],
      }
    },
    mounted() {
      // this.drawChart();
      console.log(this.$store.state.classroom);
      this.findClass();
      this.distributeData();
    },
    methods: {
      findClass() {
        this.$store.state.classroom.some(classroom => {
          const { _id } = classroom;
          if(_id === this.classroomId) {
            this.classInfo = classroom;
            classroom.students.forEach(student => {
              this.studentList[student] = { user: student, cctTotal: [], cctTime: [] };
            });
            return true;
          }
          return false;
        })
      },
      async distributeData() {
        const options = {
          url: 'class',
          params: { class: this.classroomId},
        }
        const concentrations = await this.$store.dispatch('FETCH_CONCENTRATION', options);
        concentrations.forEach(concentration => {
          this.studentList[concentration.user].cctTotal.push(concentration);
        })
      },

      getLabels() {
        let startTime = new Date("2050-10-09T06:18:33.674Z");
        let endTime = new Date("2010-10-09T06:18:33.674Z");
        function compare(a,b) {
          return a.valueOf() && b.valueOf() ? (a>b)-(a<b) : NaN;
        };

        const keys = Object.keys(this.studentList);
        keys.forEach(key => {
          const { cctTotal } = this.studentList[key];
          console.log(cctTotal);
          const length = cctTotal.length - 1;
          console.log(length, cctTotal[0], cctTotal[length]);
          if(cctTotal[0]) {
            const firstData = new Date(cctTotal[0].date);
            const lastData = new Date(cctTotal[length].date);
            startTime = compare(startTime, firstData) === -1 ? startTime : firstData;
            endTime = compare(endTime, lastData) === 1 ? endTime : lastData;
          }
        })
        startTime.setSeconds(0, 0);
        endTime.setSeconds(0, 0);
        console.log(startTime, endTime);
        
        function addMinutes(date, minutes) {
          // const ret = new Date(date);
          // return ret.setTime(ret.getTime() + minutes *60000);
          return new Date(date.getTime() + minutes * 60000);
        }
        function makeRange(sTime, eTime) {
          const labels = [];
          let time = sTime;
          while(compare(time, eTime) < 1) {
            const splits = time.toString().split(' ');
            labels.push(splits[4]);
            time = addMinutes(time, 1);
          }
          return labels;
        }
        // console.log(makeRange(startTime, endTime));
        const labels = makeRange(startTime, endTime);
        labels.forEach(label => {
          keys.forEach(key => {
            this.studentList[key].cctTime.push({
              time: label,
              concentrationArr: [],
              concentrationMean: {},
            })
          })
        });

        this.fillData();
        return labels;
      },
      fillData() {
        const id = '5f7fef73b14f4400111665c4';
        const student = this.studentList[id];
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
          this.absence.push(absenceMean);
          this.focusPoint.push(focusPointMean);
          this.sleep.push(sleepMean);
          this.turnHead.push(turnHeadMean);
        })

        return [100,2,3,4];
      },

      drawChart() {
        this.datacollection = {
          labels: this.getLabels(),
          datasets: [
            {
              label: 'Absence',
              borderColor: 'rgba(75, 19, 192, 1)',
              data: this.absence,
              fill: false,
            }, 
            {
              label: 'Focus Point',
              borderColor: 'rgba(5, 192, 192, 1)',
              data: this.focusPoint,
              fill: false,
            }, 
            {
              label: 'Sleep',
              borderColor: 'rgba(75, 192, 12, 1)',
              data: this.sleep,
              fill: false,
            }, 
            {
              label: 'Turn Head',
              borderColor: 'rgba(75, 2, 192, 1)',
              data: this.turnHead,
              fill: false,
            }
          ]
        }
      },
      getRandomInt() {
        return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
      }
    }
  }
</script>

<style>
  .small {
    max-width: 600px;
    margin: 150px auto;
  }
</style>