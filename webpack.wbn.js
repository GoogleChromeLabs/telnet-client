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

const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const WebBundlePlugin = require("webbundle-webpack-plugin");
const { WebBundleId, parsePemKey } = require("wbn-sign");
const fs = require("fs");
const path = require("path");

const privateKeyFile = "private.pem";
let privateKey;
if (process.env.ED25519KEY) {
  privateKey = process.env.ED25519KEY;
} else if (fs.existsSync(privateKeyFile)) {
  privateKey = fs.readFileSync(privateKeyFile);
}

let webBundlePlugin;
if (privateKey) {
  const parsedPrivateKey = parsePemKey(privateKey);

  webBundlePlugin = new WebBundlePlugin({
    baseURL: new WebBundleId(
      parsedPrivateKey,
    ).serializeWithIsolatedWebAppOrigin(),
    output: "telnet.swbn",
    integrityBlockSign: {
      key: parsedPrivateKey,
    },
  });
} else {
  webBundlePlugin = new WebBundlePlugin({
    baseURL: "/",
    output: "telnet.wbn",
  });
}

module.exports = merge({
  entry: "./src/index.js",
  module: {
    rules: [
      /*
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      */
      {
        test: /\.html$/,
        loader: "html-loader",
      },
    ],
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    // new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "assets" },
      ],
    }),
  ],
  resolve: {
    extensions: [".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
    trustedTypes: {
      policyName: "telnet#webpack",
    },
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
}, {
  mode: "production",
  plugins: [
    webBundlePlugin,
  ],
});
