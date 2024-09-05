const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

// const { defineConfig } = require('@vue/cli-service')
//
// module.exports = defineConfig({
//   transpileDependencies: true,
//   devServer: {
//     proxy: {
//       '/api': {
//         target: 'http://127.0.0.1:5000', // 后端服务的地址
//         changeOrigin: true,
//         pathRewrite: { '^/api': '' } // 将请求路径中的 /api 替换为空字符串
//       }
//     }
//   }
// })
