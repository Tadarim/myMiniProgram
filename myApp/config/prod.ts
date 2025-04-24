import type { UserConfigExport } from "@tarojs/cli";

export default {
  mini: {
    webpackChain(chain) {
      // 开启 tree shaking
      chain.optimization
        .usedExports(true)
        .sideEffects(true);

      // 开启代码压缩
      chain.optimization
        .minimize(true)
        .minimizer('terser')
        .use(require('terser-webpack-plugin'), [{
          terserOptions: {
            compress: {
              drop_console: true, // 移除 console
              drop_debugger: true, // 移除 debugger
              pure_funcs: ['console.log'] // 移除 console.log
            },
            mangle: true, // 混淆变量名
            format: {
              comments: false // 移除注释
            }
          },
          extractComments: false // 不提取注释到单独文件
        }]);

      // 移除未使用的代码
      chain.optimization
        .splitChunks({
          chunks: 'all',
          minSize: 20000,
          maxSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          automaticNameDelimiter: '~',
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        });
    }
  },
  h5: {
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/neutrinojs/webpack-chain
     */
    // webpackChain (chain) {
    //   /**
    //    * 如果 h5 端编译后体积过大，可以使用 webpack-bundle-analyzer 插件对打包体积进行分析。
    //    * @docs https://github.com/webpack-contrib/webpack-bundle-analyzer
    //    */
    //   chain.plugin('analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
    //   /**
    //    * 如果 h5 端首屏加载时间过长，可以使用 prerender-spa-plugin 插件预加载首页。
    //    * @docs https://github.com/chrisvfritz/prerender-spa-plugin
    //    */
    //   const path = require('path')
    //   const Prerender = require('prerender-spa-plugin')
    //   const staticDir = path.join(__dirname, '..', 'dist')
    //   chain
    //     .plugin('prerender')
    //     .use(new Prerender({
    //       staticDir,
    //       routes: [ '/pages/index/index' ],
    //       postProcess: (context) => ({ ...context, outputPath: path.join(staticDir, 'index.html') })
    //     }))
    // }
  }
} satisfies UserConfigExport<'webpack5'>
