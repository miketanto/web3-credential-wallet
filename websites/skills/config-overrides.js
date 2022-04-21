const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  webpack(config, env) {
    // READ: https://github.com/facebook/create-react-app/issues/11756#issuecomment-1001162736
    config.resolve.fallback = {
      url: require.resolve('url'),
      fs: require.resolve('fs'),
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
    }
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new NodePolyfillPlugin(),
    )

    // READ: https://stackoverflow.com/a/55298684
    config.resolve.plugins = config.resolve.plugins.filter((plugin) => !(plugin instanceof ModuleScopePlugin))

    // Resolves Framer popmotion .ejs import error
    // Refer to: https://github.com/framer/motion/issues/1307
    config.module.rules.push(
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    )

    return config
  },
  // The paths config to use when compiling the react app for development or production.
  // Overriding https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/paths.js#L62-L81
  // paths(paths, env) {
  //   // Change src path from `src` to `compiled` for production build
  //   if (env.NODE_ENV === 'production') {
  //     paths.appIndexJs = path.resolve(__dirname, 'compiled/index')
  //     paths.appSrc = path.resolve(__dirname, 'compiled/')
  //   }
  //   return paths
  // },
}
