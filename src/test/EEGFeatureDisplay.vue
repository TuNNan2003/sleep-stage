<template>
  <div class="eeg-feature-display">
    <!-- PSD 图表 -->
    <el-row>
      <el-col :span="24">
        <div id="psd-chart" style="height: 100px;"></div>
        <!-- PSD 特征选择 -->
        <div class="feature-select">
          <el-radio-group v-model="selectedFeature" @change="updateCharts">
            <el-radio v-for="feature in psdFeatureOptions" :key="feature" :label="feature">
              {{ feature }}
            </el-radio>
          </el-radio-group>
        </div>
      </el-col>
    </el-row>

    <!-- Energy、Fractal 和 Entropy 图表 -->
    <el-row>
      <el-col :span="24">
        <div id="energy-chart" style="height: 100px;"></div>
        <!-- Energy 通道选择 -->
        <div class="channel-select">
          <el-radio-group v-model="selectedEnergyChannel" @change="updateCharts">
            <el-radio v-for="channel in energyChannelOptions" :key="channel" :label="channel">
              {{ channel }}
            </el-radio>
          </el-radio-group>
        </div>

        <div id="fractal-chart" style="height: 100px;"></div>
        <!-- Fractal 通道选择 -->
        <div class="channel-select">
          <el-radio-group v-model="selectedFractalChannel" @change="updateCharts">
            <el-radio v-for="channel in fractalChannelOptions" :key="channel" :label="channel">
              {{ channel }}
            </el-radio>
          </el-radio-group>
        </div>

        <div id="entropy-chart" style="height: 100px;"></div>
        <!-- Entropy 通道选择 -->
        <div class="channel-select">
          <el-radio-group v-model="selectedEntropyChannel" @change="updateCharts">
            <el-radio v-for="channel in entropyChannelOptions" :key="channel" :label="channel">
              {{ channel }}
            </el-radio>
          </el-radio-group>
        </div>
      </el-col>
    </el-row>

    <!-- 通道选择 -->
    <el-row class="controls">
      <el-col :span="24">
        <!-- Channel select for PSD chart -->
        <div class="channel-select">
          <el-radio-group v-model="selectedChannel" @change="updateCharts">
            <el-radio v-for="channel in psdChannelOptions" :key="channel" :label="channel">
              {{ channel }}
            </el-radio>
          </el-radio-group>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    features: {
      type: Array,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    classification: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chartInstances: {},
      selectedChannel: 'channel_1',
      selectedFeature: 'Delta',
      selectedEnergyChannel: 'channel_1',
      selectedFractalChannel: 'channel_1',
      selectedEntropyChannel: 'channel_1',
      psdChannelOptions: [],
      energyChannelOptions: [],
      fractalChannelOptions: [],
      entropyChannelOptions: [],
      psdFeatureOptions: ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
      pageSize: 30,
      localFeatures: this.features // 使用 localFeatures 存储 props 的副本
    }
  },
  methods: {
    initCharts() {
      this.chartInstances = {
        psd: echarts.init(document.getElementById('psd-chart')),
        energy: echarts.init(document.getElementById('energy-chart')),
        fractal: echarts.init(document.getElementById('fractal-chart')),
        entropy: echarts.init(document.getElementById('entropy-chart'))
      }

      Object.keys(this.chartInstances).forEach(key => {
        this.chartInstances[key].setOption({
          xAxis: { type: 'category' },
          yAxis: { type: 'value' },
          series: [{ data: [], type: 'line' }]
        })
      })
    },
    updateCharts() {
      const channelData = this.localFeatures[this.selectedChannel] || []
      const startIdx = (this.currentPage - 1) * this.pageSize
      const endIdx = this.currentPage * this.pageSize
      const data = channelData.slice(startIdx, endIdx)

      // 更新 PSD 图表
      const psdData = data.slice(0, 5) // 前5列为 PSD
      this.chartInstances.psd.setOption({
        xAxis: { data: Array.from({ length: psdData.length }, (_, i) => i + 1) },
        series: [{ data: psdData }]
      })

      // 更新 Energy 图表
      const energyData = data.slice(5, 6) // Energy
      this.chartInstances.energy.setOption({
        xAxis: { data: Array.from({ length: energyData.length }, (_, i) => i + 1) },
        series: [{ data: energyData }]
      })

      // 更新 Fractal 图表
      const fractalData = data.slice(6, 7) // Fractal
      this.chartInstances.fractal.setOption({
        xAxis: { data: Array.from({ length: fractalData.length }, (_, i) => i + 1) },
        series: [{ data: fractalData }]
      })

      // 更新 Entropy 图表
      const entropyData = data.slice(7, 8) // Entropy
      this.chartInstances.entropy.setOption({
        xAxis: { data: Array.from({ length: entropyData.length }, (_, i) => i + 1) },
        series: [{ data: entropyData }]
      })
    },
    setData(features) {
      this.localFeatures = features

      // 计算通道数
      const numChannels = features[0].length / 8

      // 生成通道选项
      const channelOptions = Array.from({ length: numChannels }, (_, i) => `channel_${i + 1}`)

      this.psdChannelOptions = channelOptions
      this.energyChannelOptions = channelOptions
      this.fractalChannelOptions = channelOptions
      this.entropyChannelOptions = channelOptions

      // 默认选择第一个通道
      this.selectedChannel = channelOptions[0]
      this.selectedEnergyChannel = channelOptions[0]
      this.selectedFractalChannel = channelOptions[0]
      this.selectedEntropyChannel = channelOptions[0]

      this.updateCharts()
    }
  },
  mounted() {
    this.initCharts()
    this.updateCharts()
  },
  watch: {
    features: {
      handler(newFeatures) {
        this.setData(newFeatures)
      },
      deep: true
    },
    currentPage() {
      this.updateCharts()
    }
  }
}
</script>

<style scoped>
.eeg-feature-display {
  height: 100%; /* 组件高度填满父组件 */
  display: flex;
  flex-direction: column;
}

.el-row {
  margin-bottom: 10px;
}

.chart-container {
  flex: 1; /* 使图表容器在父组件中均匀分布 */
  overflow: hidden;
}

.chart {
  height: 125px; /* 图表容器高度 */
  width: 100%; /* 图表容器宽度 */
}

.controls {
  margin-top: 10px;
}

.channel-select,
.feature-select {
  margin-top: 10px;
}

.feature-select {
  text-align: center;
}

.feature-select .el-radio-group {
  display: inline-flex;
  justify-content: center;
}

.feature-select .el-radio {
  margin: 0 10px; /* 调整选项之间的间距 */
}

.channel-select {
  text-align: center;
}
</style>
