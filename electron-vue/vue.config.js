module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://localhost:3000/api',
        target: 'http://13.125.214.253:3000/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  outputDir: '../BE/public',
};
