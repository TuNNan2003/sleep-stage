<template>
  <div>
    <!-- ECharts 图表 -->
    <div ref="chartContainer" style="height: 80%;"></div>

    <!-- 通道选择 -->
    <div v-if="hasSignals" style="text-align: center; margin-top: 10px;">
      <el-radio-group v-model="selectedChannel" @change="updateChart">
        <el-radio v-for="channel in channels" :key="channel" :value="channel">
          {{ channel }}
        </el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      signals: {}, // 初始为空对象
      classification: [],
      selectedChannel: '',
      currentPage: 1,
      chartContainer: null,
      chartInstance: null,
      pageSize: 3000 // 每页显示的数据点数量
    }
  },
  computed: {
    hasSignals() {
      // 检查 signals 对象的每个通道是否有有效的数据
      return Object.keys(this.signals).some(channel => this.signals[channel].length > 0);
    },
    channels() {
      // 如果有有效数据，返回通道列表
      return this.hasSignals ? Object.keys(this.signals) : [];
    }
  },
  methods: {
    updateChart() {
      if (!this.signals || !this.signals[this.selectedChannel]) {
        console.log('No signals or selected channel data found.');
        return;
      }

      // 当前页的起始和结束索引
      const startIdx = (this.currentPage - 1) * this.pageSize;
      const endIdx = this.currentPage * this.pageSize;

      // 获取当前页的信号数据片段
      const data = this.signals[this.selectedChannel].slice(startIdx, endIdx);

      // 获取当前页的分类数据
      const classificationIndex = this.currentPage - 1;
      const classificationValue = this.classification[classificationIndex];

      // 打印当前页码和数据片段
      console.log('当前页码:', this.currentPage);
      console.log('信号数据片段:', data);
      console.log('分类数据:', classificationValue);

      // 标签到颜色的映射
      const labelColors = {
        0: 'blue',    // W
        1: 'green',   // 1
        2: 'orange',  // 2
        3: 'purple',  // 3
        4: 'pink',    // 4
        5: 'red',     // R
        6: 'brown'    // L
      };

      // 创建一个包含分类信息的数组（用于图表的视觉标记）
      const markPoints = data.map((_, index) => ({
        coord: [index + startIdx, data[index]],
        itemStyle: {
          color: labelColors[classificationValue] || 'gray'
        }
      }));

      this.chartInstance.setOption({
        xAxis: {
          type: 'category',
          data: data.map((_, index) => index + startIdx)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: data,
          type: 'line',
          markPoint: {
            data: markPoints
          }
        }]
      });
    },
    setData(signals, classification, currentPage) {
      this.signals = signals;
      this.classification = classification;
      this.currentPage = currentPage;
      this.$nextTick(() => {
        this.updateChart();
      });
    },
    updatePage(page) {
      this.currentPage = page;
      console.log('页码更新:', page);  // 打印新页码
      this.updateChart();
    }
  },
  mounted() {
    this.chartContainer = this.$refs.chartContainer
    this.chartInstance = echarts.init(this.chartContainer)
    console.log('ECharts instance initialized:', this.chartInstance)
    this.$nextTick(() => {
      this.updateChart();
    });
  },
  watch: {
    signals: {
      handler() {
        this.$nextTick(() => {
          this.updateChart();
        });
      },
      deep: true
    },
    selectedChannel() {
      this.$nextTick(() => {
        this.updateChart();
      });
    },
    currentPage() {
      this.updateChart();
    },
    classification: {
      handler() {
        this.$nextTick(() => {
          this.updateChart();
        });
      },
      deep: true
    }
  }
}
</script>

<style scoped>
/* 样式 */
</style>
