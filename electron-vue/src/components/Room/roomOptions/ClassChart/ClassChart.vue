<template>
  <div>
    <div class="CCTButtons">
      <div @click="displaySelectedType('focusPoint')">Focus Point</div>
      <div @click="displaySelectedType('absence')">Absence</div>
      <div @click="displaySelectedType('sleep')">Sleep</div>
      <div @click="displaySelectedType('turnHead')">TurnHead</div>
    </div>
    <div>
        <select name="dropdown" v-model="user" @click="displaySelectedUser">
            <option value="all" selected>전체</option>
            <option v-for="user in storedConnectedUsers" :key="user.user" :value="user.user">{{ user.name }}</option>
        </select>
    </div>
    <div>
        평균 점수: {{ totalPoint }}
        현재 점수: {{ currentPoint }}
    </div>
    <div class="small">
        <line-chart :chart-data="datacollection"></line-chart>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LineChart from './ClassLineChart.vue';

export default {
    name: "ClassChart",
    components: {
        LineChart,
    },
    computed: {
        CCTData() {
            return this.$store.state.webRTC.CCTData.all.avr.num;
        },
        ...mapGetters('webRTC', ['storedConnectedUsers', 'storedCCTData']),
    },
    watch: {
        CCTData: {
            immediate: true,
            handler() {
                console.log(this.$store.state.webRTC.CCTData);
                this.drawChart(this.user, this.type);
            }
        }
    },
    data() {
        return {
            totalPoint: '0',
            currentPoint: '0',
            datacollection: null,
            user: 'all', 
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
        this.drawChart(this.user, this.type);
      },
      displaySelectedUser() {
        this.drawChart(this.user, this.type);
      },
      chooseColor(key) {
        if(key === 'absence') return 'rgba(255, 255, 0, 1)';
        if(key === 'focusPoint') return 'rgba(255, 0, 0, 1)';
        if(key === 'sleep') return 'rgba(0, 255, 0, 1)';
        return 'rgba(0, 0, 255, 1)';
      },
      addDataSet(userInfo, key) {
          return {
              label: `${key}`,
              borderColor: this.chooseColor(key),
              data: this.storedCCTData[userInfo].CCT[key],
              fill: false,
          }
      },
      drawChart(user, type) {
        console.log('drawChart start --------------');
        console.log(type);
        console.log(user);
        this.totalPoint = '데이터가 없습니다.';
        this.currentPoint = '데이터가 없습니다.';
        this.datacollection = {
            labels: this.storedCCTData.all.CCT.time,
            datasets: [],
        };
        if(!this.storedCCTData[user]) return;

        const { num, ttl } =this.storedCCTData[user].avr;
        this.totalPoint = Math.floor(ttl/num);
        const lenData = this.storedCCTData[user].avr.num - 1;
        this.currentPoint = this.storedCCTData[user].CCT.focusPoint[lenData];

        const keys = Object.keys(type);
        keys.forEach(key => {
            if(type[key]) {
                this.datacollection.datasets.push(this.addDataSet(user, key));
            }
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