<template>
    <div>
      <!-- 文件上传 -->
      <div class="file-upload-container">
      <!-- 隐藏原生文件输入 -->
      <input type="file" ref="fileInput" @change="handleFileUploadnew" class="file-input" />
      <!-- 自定义按钮 -->
      <el-button type="primary" @click="triggerFileInput" class="custom-upload-button">
        <i class="el-icon-upload"></i>
        <span class="upload-text">上传文件</span>
      </el-button>
    </div>
  
      <!-- 睡眠周期图例 -->
      <div class="legend">
        <div v-for="(color, label) in colorMap" :key="label" :style="{ backgroundColor: color }" class="legend-item-new">
          {{ sleepStages[label] }}
        </div>
      </div>
  
      <!-- 通道选择 -->
      <el-select v-model="selectedChannel" @change="updateCharts" placeholder="选择通道">
        <el-option label="Channel 1" value="channel_1"></el-option>
        <el-option label="Channel 2" value="channel_2"></el-option>
      </el-select>
  
      <!-- 标签修改 -->
      <el-select v-model="newLabel" placeholder="选择新标签">
        <el-option v-for="(stage, index) in sleepStages" :key="index" :label="stage" :value="index"></el-option>
      </el-select>
      <el-button @click="modifyLabel">修改当前页标签</el-button>
  
      <!-- 标签保存 -->
      <el-button @click="saveLabelsToCSV">保存标签为 CSV</el-button>
  
      <!-- 原始信号图表 -->
      <div ref="rawSignalChartNew" class="chart-container"></div>
  
      <!-- 特征图表切换显示 -->
      <div class="feature-navigation-container">
        <el-button class="nav-button" type="primary" icon="ArrowLeft" :disabled="currentFeatureIndex === 0" @click="previousFeature"></el-button>
        <div class="features-grid-new">
          <transition name="fade">
            <div v-show="currentFeatureIndex === 0" class="psd-container-new">
              <div ref="featureChart1" class="chart-container-new"></div>
              <el-radio-group v-if="psdChartInitialized" v-model="selectedPSDIndex" @change="updatePSDChart" class="psd-radio-group-new">
                <el-radio-button v-for="index in 5" :key="index" :label="index - 1" class="psd-radio-button-new">
                  {{ index }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </transition>
          <transition name="fade">
            <div v-show="currentFeatureIndex === 1" class="psd-container-new">
              <div ref="featureChart2" class="chart-container-new"></div>
            </div>
          </transition>
          <transition name="fade">
            <div v-show="currentFeatureIndex === 2" class="psd-container-new">
              <div ref="featureChart3" class="chart-container-new"></div>
            </div>
          </transition>
          <transition name="fade">
            <div v-show="currentFeatureIndex === 3" class="psd-container-new">
              <div ref="featureChart4" class="chart-container-new"></div>
            </div>
          </transition>
        </div>
        <el-button class="nav-button" type="primary" icon="ArrowRight" :disabled="currentFeatureIndex === 3" @click="nextFeature"></el-button>
      </div>
  
      <!-- 翻页控件 -->
      <div class="pagination-controls">
        <el-button :disabled="currentPage <= 99" @click="jumpPages(-100)"> 100&lt;&lt; </el-button>
        <el-button :disabled="currentPage <= 9" @click="jumpPages(-10)"> 10&lt;&lt; </el-button>
        <el-button :disabled="currentPage <= 0" @click="previousPage"> 1&lt;&lt; </el-button>
        <span> 第 {{ currentPage + 1 }} 页 </span>
        <el-button :disabled="currentPage >= maxPage" @click="nextPage"> &gt;&gt;1 </el-button>
        <el-button :disabled="currentPage >= Math.max(maxPage - 9, 0)" @click="jumpPages(+10)"> &gt;&gt;10 </el-button>
        <el-button :disabled="currentPage >= Math.max(maxPage - 99, 0)" @click="jumpPages(+100)"> &gt;&gt;100 </el-button>
  
        <el-button @click="toggleAutoPaging">{{ autoPaging ? '停止自动翻页' : '开始自动翻页' }}</el-button>
      </div>
  
    </div>
  </template>
  
  
  <script>
  import * as echarts from 'echarts';
  import axios from 'axios';
  import { ElSelect, ElOption, ElButton, ElRadioGroup, ElRadioButton } from 'element-plus';
  
  export default {
    name: "testNew",
    components: {
      ElSelect,
      ElOption,
      ElButton,
      ElRadioGroup,
      ElRadioButton
    },
    data() {
      return {
        raw_signals: null,
        features: null,
        classification: null,
        selectedChannel: 'channel_1',
        currentPage: 0,
        maxPage: 0,
        autoPaging: false,  // 是否自动翻页
        pagingSpeed: 100,  // 自动翻页速度（默认100毫秒）
        pagingInterval: null,  // 自动翻页的定时器
        newLabel: null,  // 用于存储新标签值
        featureOptions: [],  // 下半部分四个特征图表选项
        featureCharts: [],   // 特征图表对象数组
        selectedPSDIndex: 0,  // 选中的PSD维度索引
        psdChartInitialized: false, // PSD 图表是否已初始化
        currentFeatureIndex: 0,  // 当前显示的特征图表索引
        colorMap: {
          0: '#FF0000', // W - 红色
          1: '#00FF00', // N1 - 绿色
          2: '#0000FF', // N2 - 蓝色
          3: '#FFFF00', // N3 - 黄色
          4: '#FF00FF', // N4 - 品红色
          5: '#00FFFF', // R - 青色
          6: '#800080'  // L - 紫色
        },
        sleepStages: {
          0: 'W (清醒)',
          1: 'N1 (浅睡)',
          2: 'N2 (中度睡眠)',
          3: 'N3 (深度睡眠)',
          4: 'N4 (极深睡眠)',
          5: 'R (快速眼动)',
          6: 'L (运动觉醒)'
        }
      };
    },
    methods: {
      triggerFileInput() {
        this.$refs.fileInput.click(); // 触发原生文件输入的点击事件
      },
      async handleFileUploadnew(event) {
        console.log("enter")
        const file = event.target.files[0];
        if (!file) {
          console.log("error file")
          return;
        }
  
        const formData = new FormData();
        formData.append('file', file);
        console.log(formData['file'])
        try {
          console.log("ready to post")
          const response = await axios.post('http://127.0.0.1:5000/upload', formData);
          console.log("post end")
          this.raw_signals = response.data.raw_signals;
          this.features = response.data.features;
          this.classification = response.data.classification;
  
          // debug
          console.log("Response data:", response.data);
          console.log("raw signals:", this.raw_signals);
          console.log("features:", this.features);
          console.log("classification:", this.classification);
  
          this.maxPage = Math.floor((this.raw_signals[this.selectedChannel].length - 3000) / 3000);

          this.initializeCharts();

        } catch (error) {
          console.error("Error uploading file:", error);
        }
      },
      jumpPages(amount) {
        const newPage = this.currentPage + amount;
        if (newPage >= 0 && newPage <= this.maxPage) {
          this.currentPage = newPage;
          this.updateCharts();
        }
      },
      toggleAutoPaging() {
        if (this.autoPaging) {
          clearInterval(this.pagingInterval);
          this.autoPaging = false;
        } else {
          this.autoPaging = true;
          this.pagingInterval = setInterval(() => {
            if (this.currentPage < this.maxPage) {
              this.nextPage();
            } else {
              this.toggleAutoPaging();  // 到最后一页时停止自动翻页
            }
          }, this.pagingSpeed);
        }
      },
      modifyLabel() {
        if (this.newLabel !== null && this.currentPage >= 0 && this.currentPage <= this.maxPage) {
          this.classification[this.currentPage] = this.newLabel;
          this.updateCharts(); // 更新图表颜色
        }
      },
      saveLabelsToCSV() {
        const csvContent = "data:text/csv;charset=utf-8," + this.classification.map((label, index) => `${index},${label}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "labels.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      initializeCharts() {
        if (!this.raw_signals || !this.raw_signals[this.selectedChannel]) return;
  
        this.initRawSignalChart();
        this.initFeatureCharts();
  
        // 设置 PSD 图表已初始化状态
        this.psdChartInitialized = true;
      },
      initRawSignalChart() {
        const chart = echarts.init(this.$refs.rawSignalChartNew);
        const option = this.createRawSignalOption(this.raw_signals[this.selectedChannel].slice(0, 3000));
        chart.setOption(option);
        this.rawSignalChartNew = chart;
      },
      initFeatureCharts() {
        if (!this.features || !Array.isArray(this.features) || this.features.length === 0) {
          console.error("Feature data is undefined or invalid");
          return;
        }
  
        this.featureOptions = this.createFeatureOptions(this.features, 0, this.selectedChannel);
  
        this.$nextTick(() => {
        // 初始化每个特征图表
        const chart1 = echarts.init(this.$refs.featureChart1);
        chart1.setOption(this.featureOptions[0]);
        this.featureCharts[0] = chart1;

        const chart2 = echarts.init(this.$refs.featureChart2);
        chart2.setOption(this.featureOptions[1]);
        this.featureCharts[1] = chart2;

        const chart3 = echarts.init(this.$refs.featureChart3);
        chart3.setOption(this.featureOptions[2]);
        this.featureCharts[2] = chart3;

        const chart4 = echarts.init(this.$refs.featureChart4);
        chart4.setOption(this.featureOptions[3]);
        this.featureCharts[3] = chart4;

        console.log("Feature charts initialized: ", this.featureCharts);
        });
      },
      createRawSignalOption(signalData) {
        return {
          title: { text: 'Raw Signal' },
          xAxis: { type: 'category', data: Array.from({ length: signalData.length }, (_, i) => i) },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: signalData }]
        };
      },
      createFeatureOptions(features, start, channel) {
        const options = [];
        const channelIndex = parseInt(channel.match(/\d+/)[0], 10) - 1;
        const offset = channelIndex * 8;  // 每个通道偏移8列
  
        // 特征1：前5列，动态展示selectedPSDIndex
        const feature1Data = features.slice(start, start + 30).map(row => row.slice(offset, offset + 5));
        options.push({
          title: { text: `PSD Dimension ${this.selectedPSDIndex + 1}` },
          xAxis: { type: 'category', data: Array.from({ length: feature1Data.length }, (_, i) => i) },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: feature1Data.map(d => d[this.selectedPSDIndex]) }]
        });
  
        // 特征2：第6列（能量）
        const feature2Data = features.slice(start, start + 30).map(row => row[offset + 5]);
        options.push({
          title: { text: 'Energy' },
          xAxis: { type: 'category', data: Array.from({ length: feature2Data.length }, (_, i) => i) },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: feature2Data }]
        });
  
        // 特征3：第7列（分形）
        const feature3Data = features.slice(start, start + 30).map(row => row[offset + 6]);
        options.push({
          title: { text: 'Fractal' },
          xAxis: { type: 'category', data: Array.from({ length: feature3Data.length }, (_, i) => i) },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: feature3Data }]
        });
  
        // 特征4：第8列（熵）
        const feature4Data = features.slice(start, start + 30).map(row => row[offset + 7]);
        options.push({
          title: { text: 'Entropy' },
          xAxis: { type: 'category', data: Array.from({ length: feature4Data.length }, (_, i) => i) },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: feature4Data }]
        });

        console.log(options)
  
        return options;
      },
      updatePSDChart() {
        // 只更新PSD图表
        console.log(this.features)
        this.featureOptions[0] = this.createFeatureOptions(this.features, this.currentPage * 100, this.selectedChannel)[0];
        this.featureCharts[0].setOption(this.featureOptions[0]);
      },
      updateCharts() {
        if (!this.raw_signals || !this.raw_signals[this.selectedChannel] || !this.features) return;
        if (!this.featureCharts || !Array.isArray(this.featureCharts)) return;
  
        const start = this.currentPage * 3000;
        const rawSignalData = this.raw_signals[this.selectedChannel].slice(start, start + 3000);
  
        // 获取当前页的标签
        const pageLabels = this.classification.slice(this.currentPage, this.currentPage + 1);
  
        // 根据标签设置颜色
        const colorMap = {
          0: '#FF0000', // 红色
          1: '#00FF00', // 绿色
          2: '#0000FF', // 蓝色
          3: '#FFFF00', // 黄色
          4: '#FF00FF', // 品红色
          5: '#00FFFF', // 青色
          6: '#800080'  // 紫色
        };
        const rawSignalColor = colorMap[pageLabels[0]];
  
      // 更新原始信号图表
      this.rawSignalChartNew.setOption({
        series: [{
          data: rawSignalData,
          lineStyle: { color: rawSignalColor }, // 设置线条颜色
          areaStyle: { color: rawSignalColor, opacity: 0.2 } // 设置区域填充色
        }]
      });
        console.log("updateCharts更新原始信号成功")
  
        // 创建并更新特征图表
        this.featureOptions = this.createFeatureOptions(this.features, this.currentPage * 30, this.selectedChannel);
        this.featureCharts.forEach((chart, index) => {
          if(chart){
          const featureColor = colorMap[pageLabels[0]];
          this.featureOptions[index].series[0].lineStyle = { color: featureColor };
          this.featureOptions[index].series[0].areaStyle = { color: featureColor, opacity: 0.2 };
          chart.setOption(this.featureOptions[index]);
          }
        });
      },
      previousPage() {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.updateCharts();
        }
      },
      nextPage() {
        if (this.currentPage < this.maxPage) {
          this.currentPage++;
          const chart1 = echarts.init(this.$refs.featureChart1);
          chart1.setOption(this.featureOptions[0]);
          this.featureCharts[0] = chart1;

          const chart2 = echarts.init(this.$refs.featureChart2);
          chart2.setOption(this.featureOptions[1]);
          this.featureCharts[1] = chart2;

          const chart3 = echarts.init(this.$refs.featureChart3);
          chart3.setOption(this.featureOptions[2]);
          this.featureCharts[2] = chart3;

          const chart4 = echarts.init(this.$refs.featureChart4);
          chart4.setOption(this.featureOptions[3]);
          this.featureCharts[3] = chart4;
          this.updateCharts();
        }
      },
      previousFeature() {
        if (this.currentFeatureIndex > 0) {
          this.currentFeatureIndex--;
        }
      },
      nextFeature() {
        if (this.currentFeatureIndex < 3) {
          this.currentFeatureIndex++;
        }
      },
      beforeUnmount() {
        // 在组件销毁前清除定时器
        if (this.pagingInterval) {
          clearInterval(this.pagingInterval);
        }
      }
    }
  };
  </script>
  
  <style>
  /* 全局样式和字体调整 */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif; /* 使用更现代的字体 */
  }
  
  .main-container {
  font-family: Arial, Helvetica, sans-serif;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  }
  
  .file-upload-container {
  display: flex;
  justify-content: center; /* 居中对齐 */
  align-items: center;
  height: 1vh; /* 使其垂直居中 */
}

/* 隐藏原生文件输入 */
.file-input {
  display: none;
}

/* 自定义按钮样式 */
.custom-upload-button {
  background-color: #409eff;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

/* 按钮悬停效果 */
.custom-upload-button:hover {
  background-color: #66b1ff;
}

/* 调整图标与文本间距 */
.custom-upload-button i {
  margin-right: 8px;
}

/* 美化上传文本 */
.upload-text {
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  font-size: 18px;
}
  
  /* 图例样式调整 */
  .legend {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
  } 
  
  .legend-item-new {
  width: 100px;
  height: 20px;
  color: #fff;
  text-align: center;
  line-height: 20px;
  border-radius: 4px;
  transition: transform 0.3s ease;
  }

  .legend-item-new:hover {
  transform: scale(1.1);
  }
  
  /* 控制面板样式优化 */
  .control-panel {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
  }
  
  .control-select {
  margin-right: 10px;
}

.control-button {
  padding: 4px 12px;
  border-radius: 4px;
}
  
  .control-button {
    background-color: #007bff;
    color: white;
    cursor: pointer;
    padding: 8px 16px;
  }
  
  .control-button:hover {
    background-color: #0056b3;
  }

  .chart-container {
  width: 100%;
  height: 400px;
  }

  .psd-container-new {
  width: 100%;
  height: 400px;
  }
  
  /* 图表容器样式 */
  .chart-container-new {
  width: 500px;
  height: 300px;
  margin-bottom: 20px;
  }
  
  .features-grid-new {
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  width: 100%;
  }
  
  /* 翻页控件样式 */
  .pagination-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    padding: 10px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .pagination-button {
    margin: 0 5px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 8px;
  }
  
  .pagination-button:disabled {
    background-color: #ccc;
  }
  
  .pagination-button:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  .pagination-controls span {
    margin: 0 10px;
    font-weight: bold;
  }

  .feature-navigation-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  }

.nav-button {
  margin: 0 10px;
}

  </style>
  