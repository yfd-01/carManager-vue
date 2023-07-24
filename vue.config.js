const path = require('path')
const CompressionWebpackPlugin = require("compression-webpack-plugin")
const productionGzipExtensions = ['js', 'css']

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = {
  publicPath: "./",
  productionSourceMap: false, //打包不生成map
  chainWebpack: config => {
    config.module.rules.delete("svg"); // 重点:删除默认配置中处理svg,
    config.module
      .rule('svg-sprite-loader')
      .test(/\.svg$/)
      .include
      .add(resolve('src/assets/icons')) // 处理svg目录
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
  },
  configureWebpack: {
    plugins: [
      // 配置compression-webpack-plugin压缩
      // new CompressionWebpackPlugin({
      //   algorithm: 'gzip',
      //   test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
      //   threshold: 10240,
      //   minRatio: 0.8
      // })
    ]
  }
};
