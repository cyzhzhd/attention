module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://localhost:3000/api',
        // target: 'https://swm183.com/api',
        target: 'http://13.125.214.253:5000/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  outputDir: './public',
};
