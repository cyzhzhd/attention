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
  components: {
    LineChart,
  },
  computed: {
    ...mapGetters('dashboard', [
      'classId',
      'studentList',
      'displayingUserList',
      'datacollection',
      'CCTType',
    ]),
  },
  methods: {
    ...mapActions('dashboard', [
      'ChangeDisplayingUserList',
      'GetLabels',
      'FillStudentList',
      'DistributeCCTData',
      'DisplayData',
    ]),
  },
  async mounted() {
    bus.$on('changeDisplayingData', () => {});
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
