<template>
  <div id="app">
    <!-- 引入 EEGDisplay 组件 -->
    <EEGDisplay />
  </div>
</template>

<script>
import EEGDisplay from './components/EEGDisplay.vue'; // 确保路径正确

export default {
  name: 'App',
  components: {
    EEGDisplay
  }
};
</script>

<style>
/* 可以在这里添加全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
