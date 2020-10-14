module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
    },
  },
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       // target: 'http://localhost:3000/api',
  //       // target: 'https://swm183.com/api',
  //       // target: 'http://13.125.214.253:5000/api',
  //       target: 'https://be.swm183.com:3000',
  //       changeOrigin: true,
  //       pathRewrite: {
  //         '^/api': '',
  //       },
  //     },
  //   },
  // },
  outputDir: './public',
};
