const { defineConfig } = require('@vue/cli-service')
const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];

module.exports = defineConfig({
  configureWebpack: config => {
    config.plugins.push(new CompressionWebpackPlugin({
      algorithm: 'gzip',
      test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8
    }));
    config.devtool = false;
    return {
      output: {
        filename: `static/js/[name].[contenthash].js`,
        chunkFilename: `static/js/[id].[chunkhash].js`
      }
    };
  },
  chainWebpack: config => {
    config.plugins.delete("prefetch");
    // 移除 preload 插件
    config.plugins.delete('preload');
    // 压缩代码
    config.optimization.minimize(true)
  },
  publicPath: './',
  transpileDependencies: true,
  lintOnSave:false,
  devServer: {
    port: 8080,
    proxy: {
      // 配置所有以 '/v3' 开头的请求路径
      '/v3': {
        target: 'https://moderation.cn-east-3.myhuaweicloud.com/v3/',  // 代理目标的端口路径
        // pathRewrite: { '^/api1': '' },  // 替换请求路径中的字符
        changeOrigin:true,  // 是否更改配置代理服务器的端口号
        pathRewrite: {
          '^/v3': '/'  //必须这样写
        }
      },
    }
  }
})
console.log("process.env:", process.env.NODE_ENV)
