<template>
  <div>
    <div class="CCTButtons">
      <div @click="displaySelectedType('focusPoint')">Focus Point</div>
      <div @click="displaySelectedType('absence')">Absence</div>
      <div @click="displaySelectedType('sleep')">Sleep</div>
      <div @click="displaySelectedType('turnHead')">TurnHead</div>
    </div>
    <div>
        
    </div>
    <div class="small">
        <line-chart :chart-data="datacollection"></line-chart>
    </div>
  </div>
</template>

<script>
import LineChart from './ClassLineChart.vue';

export default {
    name: "ClassChart",
    components: {
        LineChart,
    },
    computed: {
        CCTData() {
            return this.$store.state.webRTC.CCTData.all.avr.num;
        }
    },
    watch: {
        CCTData: {
            immediate: true,
            handler() {
                console.log(this.$store.state.webRTC.CCTData);
                // chart 그리기
                this.drawChart(this.userList, this.type);
            }
        }
    },
    data() {
        return {
            datacollection: null,
            userList: [],
            type: {
              focusPoint: true,
              absence: false,
              sleep: false,
              turnHead: false,
            },
        }
    },

    methods: {
      displaySelectedType(dataType) {
        this.type[dataType] = !this.type[dataType];
        this.drawChart(this.userList, this.type);
      },
      displaySelectedUser(student) {
        const index = this.userList.findIndex((user) => user.user === student.user);
        if(index === -1) {
            this.userList.push({user: student.user, name: student.name});
        } else {
            this.userList.splice(index, 1);
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
    }
}
</script>

<style>
  .small {
    /* max-width: 200px; */
    height: 150px;
    width: 400px;
    /* margin: 150px auto; */
  }
</style>