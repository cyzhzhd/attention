module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
    },
  },
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://localhost:3000/api',
        // target: 'https://swm183.com/api',
        // target: 'http://13.125.214.253:5000/api',
        target:
          'http://backendLB-d5c9491c188b429e.elb.ap-northeast-2.amazonaws.com:3000/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  outputDir: './public',
};
