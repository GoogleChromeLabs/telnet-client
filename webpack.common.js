/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebBundlePlugin = require('webbundle-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new MiniCssExtractPlugin(),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true
    }),
    new WebpackPwaManifest({
      filename: "manifest.webmanifest",
      short_name: "Telnet",
      name: "Telnet",
      icons: [
        {
          src: path.resolve("src/images/icons-vector.svg"),
          sizes: "48x48 72x72 96x96 128x128 256x256 512x512 1024x1024",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: path.resolve("src/images/icons-192.png"),
          type: "image/png",
          sizes: "192x192",
          purpose: "any maskable"
        },
        {
          src: path.resolve("src/images/icons-512.png"),
          type: "image/png",
          sizes: "512x512",
          purpose: "any maskable"
        }
      ],
      "id": "",
      "start_url": "./?source=pwa",
      "display": "standalone",
      "scope": "./",
      "isolated_storage": true,
      "permissions_policy": {
        "direct-sockets": [ "self"]
      }
    }),
    new WebBundlePlugin({
      baseURL: '/',
      output: 'telnet.wbn'
    })
  ],
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
    trustedTypes: {
      policyName: 'telnet#webpack',
    }
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
