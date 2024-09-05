<template>
  <div class="upload-demo">
    <button @click="handleClick">点击上传 .npy 文件</button>
    <input
        ref="fileInput"
        type="file"
        accept=".npy"
        style="display: none;"
        @change="handleFileChange"
    />
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  emits: ['file-uploaded'],
  methods: {
    handleClick() {
      // 点击按钮时触发文件输入框的点击事件
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (this.beforeUpload(file)) {
        this.uploadFile(file);
      }
    },
    beforeUpload(file) {
      const isNpy = file.name.endsWith('.npy');
      if (!isNpy) {
        ElMessage.error('只能上传 .npy 文件!');
      }
      return isNpy;
    },
    async uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // 使用 Axios 进行文件上传
        const response = await axios.post('http://localhost:5000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const data = response.data;
        console.log('文件上传成功:', data);
        ElMessage.success('文件上传成功!');

        // 发送解析后的数据到父组件
        this.$emit('file-uploaded', data);
      } catch (error) {
        console.error('文件上传失败:', error);
        ElMessage.error('文件上传失败!');
      }
    }
  }
};
</script>

<style scoped>
.upload-demo {
  border-radius: 4px;
  padding: 10px;
  text-align: center;
}

button {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #66b1ff;
}
</style>
