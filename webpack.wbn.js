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

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const WebBundlePlugin = require('webbundle-webpack-plugin');
const { WebBundleId, parsePemKey } = require('wbn-sign');
const fs = require("fs");
require('dotenv').config({ path: '.env' });

const privateKeyFile = process.env.KEYFILE || "private.pem";
let privateKey;
if (process.env.KEY) {
  privateKey = process.env.KEY;
} else if (fs.existsSync(privateKeyFile)) {
  privateKey = fs.readFileSync(privateKeyFile);
}

let webBundlePlugin;
if (privateKey) {
  const parsedPrivateKey = parsePemKey(privateKey);

  webBundlePlugin = new WebBundlePlugin({
    baseURL: new WebBundleId(
      parsedPrivateKey
    ).serializeWithIsolatedWebAppOrigin(),
    output: 'telnet.swbn',
    integrityBlockSign: {
      key: parsedPrivateKey
    },
  });
} else {
  webBundlePlugin = new WebBundlePlugin({
    baseURL: '/',
    output: 'telnet.wbn',
  });
}

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    webBundlePlugin,
  ]
});
