<template>
  <div class="small">
    <line-chart :chart-data="datacollection"></line-chart>
    <button @click="drawChart()">Show</button>
  </div>
</template>

<script>
import bus from '../../../../../utils/bus';
import LineChart from './ClassLineChart.vue';

export default {
    name: "ClassChart",
    components: {
        LineChart,
    },
    data() {
        return {
            CCTDATA: { all: {}, },
        }
    },
    methods: {

    },
    mounted() {
        bus.$on('deliverConcenteration', (CCTData) => {
            console.log(CCTdata);
        })
    },
    beforeDestroy() {
        bus.$off('deliverConcenteration');
    },
}
</script>

<style>

</style>