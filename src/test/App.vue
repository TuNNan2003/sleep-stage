<template>
  <el-container class="full-height">
    <!-- 顶部栏 -->
    <el-header class="header">
      <h1>睡眠分期系统</h1>
    </el-header>

    <!-- 主内容 -->
    <el-container>
      <el-main>
        <!-- 上传框 -->
        <div class="upload-container">
          <FileUpload @file-uploaded="handleFileUpload" />
        </div>
        <!-- 显示区域 -->
        <el-row class="display-row">
          <el-col :span="12" class="signal">
            <EEGSignalDisplay :signals="signals" :classification="classification" :current-page="currentPage" />
          </el-col>
          <el-col :span="12" class="feature">
            <EEGFeatureDisplay :features="features" :classification="classification" :current-page="currentPage" />
          </el-col>
        </el-row>
        <!-- 分页 -->
        <el-pagination
            layout="prev, pager, next, jumper"
            :total="totalItems"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="handlePageChange"
            class="pagination"
        />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import FileUpload from './FileUpload.vue'
import EEGSignalDisplay from './EEGSignalDisplay.vue'
import EEGFeatureDisplay from './EEGFeatureDisplay.vue'

export default {
  components: {
    FileUpload,
    EEGSignalDisplay,
    EEGFeatureDisplay
  },
  data() {
    return {
      signals: { channel_1: [], channel_2: [] },
      features: [],
      classification: null,
      currentPage: 1,
      pageSize: 3000
    }
  },
  computed: {
    totalItems() {
      // 假设信号数据长度和特征数据长度一致，计算总数据点数
      return this.signals.channel_1.length;
    }
  },
  methods: {
    handleFileUpload(response) {
      this.signals = response.raw_signals
      this.features = response.features
      this.classification = response.classification
      this.currentPage = 1 // 上传新文件时重置分页
    },
    handlePageChange(page) {
      this.currentPage = page
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.full-height {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: aliceblue;
  color: darkslateblue;
  text-align: center;
  padding: 10px;
}

.upload-container {
  background-color: #F5F7FA;
  text-align: center;
}

.signal {
  border: 2px dashed #dcdfe6;
}

.feature {
  border: 2px dashed #dcdfe6;
}

.el-main {
  flex: 1; /* 使主内容区占用剩余空间 */
}

.el-row {
  flex: 1;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
