<template>
        <!-- 引入 EEGDisplay 组件 -->
        <originPage />
</template>

<script>
import originPage from '../components/EEGDisplay.vue'; // 确保路径正确
export default {
  name: 'AboutPage',
  components: {
    originPage
  }
};
</script>