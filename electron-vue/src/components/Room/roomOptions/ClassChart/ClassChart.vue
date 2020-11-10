<template>
  <div class="cct-graph-align">
    <div class="CCTButtons">
      <div class="cct-buttons" @click="displaySelectedType('focusPoint')">
        Focus Point
      </div>
      <div class="cct-buttons" @click="displaySelectedType('absence')">
        Absence
      </div>
      <div class="cct-buttons" @click="displaySelectedType('sleep')">
        Sleep
      </div>
      <div class="cct-buttons" @click="displaySelectedType('turnHead')">
        TurnHead
      </div>
    </div>

    <div class="dropdown">
      <select name="dropdown" v-model="user" @click="displaySelectedUser">
        <option value="all" selected>전체</option>
        <option
          v-for="user in storedConnectedUsers"
          :key="user.user"
          :value="user"
        >
          {{ user.name }}
        </option>
      </select>
    </div>
    <div class="points">
      평균 점수: {{ totalPoint }} 현재 점수: {{ currentPoint }}
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
  name: 'ClassChart',
  components: {
    LineChart,
  },
  computed: {
    ...mapGetters('webRTC', ['storedConnectedUsers', 'storedCCTData']),
  },
  data() {
    return {
      totalPoint: '0',
      currentPoint: '0',
      datacollection: null,
      user: 'all',
      interval: '',
      type: {
        focusPoint: true,
        absence: false,
        sleep: false,
        turnHead: false,
      },
    };
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
      if (key === 'absence') return 'rgba(254, 245, 160, 1)';
      if (key === 'focusPoint') return 'rgba(253, 173, 178, 1)';
      if (key === 'sleep') return 'rgba(119, 140, 252, 1)';
      return 'rgba(0, 0, 255, 1)';
    },
    addDataSet(userInfo, key) {
      const ret = {
        label: `${key}`,
        borderColor: this.chooseColor(key),
        fill: false,
      };
      if (userInfo === 'all') {
        ret.data = this.storedCCTData.CCT[key];
      } else {
        ret.data = userInfo.CCTData.CCT[key];
      }
      return ret;
    },
    drawChart(user, type) {
      console.log('drawChart start --------------');
      console.log(type);
      console.log(user);
      this.totalPoint = '데이터가 없습니다.';
      this.currentPoint = '데이터가 없습니다.';
      this.datacollection = {
        datasets: [],
      };
      if (!user.CCTData && user !== 'all') return;
      if (user === 'all') {
        this.datacollection.labels = this.storedCCTData.CCT.time;
      } else {
        this.datacollection.labels = user.CCTData.CCT.time;
      }

      const calculatePoint = target => {
        const { num, ttl } = target.avr;
        console.log(num, ttl);

        this.currentPoint = Math.floor(target.CCT.focusPoint[num - 1]);
        this.totalPoint = Math.floor(ttl / num);
      };
      if (user === 'all') {
        calculatePoint(this.storedCCTData);
      } else {
        calculatePoint(user.CCTData);
      }

      const keys = Object.keys(type);
      keys.forEach(key => {
        if (type[key]) {
          this.datacollection.datasets.push(this.addDataSet(user, key));
        }
      });
      console.log('drawChart end --------------');
    },
  },
  mounted() {
    this.interval = setInterval(
      () => this.drawChart(this.user, this.type),
      5000,
    );
    this.drawChart(this.user, this.type);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
.CCTButtons {
  display: flex;
  flex-direction: row;
  align-content: center;
}

.cct-buttons {
  padding: 10px;
  color: #666666;
}

.points {
  color: #666666;
}
.small {
  /* max-width: 200px; */
  height: 150px;
  width: 400px;
  /* margin: 150px auto; */
}

.cct-graph-align {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropdown {
  margin: 10px;
}
</style>
