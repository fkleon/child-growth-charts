const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv) => {
  const production = argv.mode === 'production';

  return {
    entry: './src/index.ts',
    devtool: production ? 'source-map' : 'inline-cheap-source-map',
    plugins: [
      production ? new MiniCssExtractPlugin() : undefined,
      new HtmlWebpackPlugin({
        title: 'Interactive Child Growth Charts',
        favicon: './src/assets/favicon.ico',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [
            production ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            production ? MiniCssExtractPlugin.loader : 'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            {
              loader: 'sass-loader',
              options: {
                // Use the modern Sass JS API instead of the deprecated
                // legacy one.
                api: 'modern',
                sassOptions: {
                  // Silence deprecation warnings coming from third-party
                  // stylesheets (e.g. chartist's own Sass, which still
                  // uses @import/global functions) - we can't fix those,
                  // but warnings from our own styles should still surface.
                  quietDeps: true,
                },
              },
            },
          ],
        },
        {
          test: /\.(jpg|png|svg|gif)$/,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'build/dist'),
    },
    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    performance: {
      // The actual gzipped transfer size is well within budget; the default
      // 244 KiB limit is based on uncompressed size and doesn't account for
      // compression, which is enabled by essentially all static hosts.
      maxAssetSize: 300 * 1024,
      maxEntrypointSize: 300 * 1024,
    },
  };
};
