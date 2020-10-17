<template>
  <div class="small">
    <line-chart :chart-data="datacollection"></line-chart>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex';
import LineChart from './ClassLineChart.vue';

export default {
    name: "ClassChart",
    components: {
        LineChart,
    },
    computed: {
        // ...mapGetters('webRTC', ['storedCCTData']),
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
            }
        }
    },
    data() {
        return {
            datacollection: null,
            targetId: '',
        }
    },
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