import path from 'node:path';

import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

import devConfig from './dev';
import prodConfig from './prod';
// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'myApp',
    date: '2025-3-17',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false
      }
    },
    cache: {
      enable: true // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            selectorBlackList: ['nut-']
          }
        },
        lessLoaderOption: {
          lessOptions: {
            // 启用模块化
            modules: true,
            // 可选：自定义模块化规则
            localIdentName: '[name]__[local]___[hash:base64:5]'
          }
        },
        cssModules: {
          enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin);

        // 生产环境优化配置
        if (process.env.NODE_ENV === 'production') {
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

          // 代码分割优化
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
      }
    },
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  };
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
