const { defineConfig } = require("@vue/cli-service")
module.exports = defineConfig({
  transpileDependencies: true,
  // Add publicPath to ensure assets are loaded correctly
  publicPath: "/",
  // Ensure proper output directory
  outputDir: "dist",
  // Add source maps for easier debugging
  productionSourceMap: true,
  // Configure webpack for better performance
  configureWebpack: {
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
  },
})

