module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://localhost:3000/api',
        target: 'https://swm183.com/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  outputDir: '../BE/public',
};
