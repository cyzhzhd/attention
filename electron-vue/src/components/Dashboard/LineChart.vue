<script>
/* eslint no-underscore-dangle: 0 */
import { Line, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: ['chartData', reactiveProp],
  props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  // watch: {
  //   chartData() {
  //     this.$data._chart.destroy();
  //     this.renderChart(this.chartData, this.options);
  //     this.$data._chart.resetZoom();
  //   },
  // },
};
</script>

<style></style>
