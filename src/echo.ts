/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Update the status line.
 * @param {string} status
 */
function setStatus(status: string) {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = status;
  }
}

/**
 * Run an echo server for `client`.
 * @param {TCPSocket} client
 */
async function echoServer(client: TCPSocket) {
  const {readable, writable, remoteAddress, remotePort} = await client.opened;
  const connectionElement = document.createElement('li');
  const byteCountElement = document.createElement('span');
  byteCountElement.textContent = '0';
  connectionElement.append(
      `Connection from ${remoteAddress} port ${remotePort} - `,
      byteCountElement,
      ' bytes received'
  );

  const connectionsElement = document.getElementById('connections');
  if (connectionsElement) {
    connectionsElement.appendChild(connectionElement);
  }

  let byteCount = 0;
  const reader = readable.getReader();
  const writer = writable.getWriter();
  try {
    for (;;) {
      const {value, done} = await reader.read();
      if (done) {
        connectionElement.append(' - Closed');
        break;
      }
      byteCount += value.byteLength;
      byteCountElement.textContent = byteCount.toString();
      writer.write(value);
    }
  } catch (e) {
    connectionElement.append(` - ${e.name}: ${e.message}`);
  }

  await reader.releaseLock();
  await writer.close();
  await client.close();
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const server = new TCPServerSocket('::');
    const {readable, localAddress, localPort} = await server.opened;
    setStatus(`Listening on ${localAddress} port ${localPort}`);

    const reader = readable.getReader();
    for (;;) {
      const {value, done} = await reader.read();
      if (done) {
        setStatus('Socket closed');
        break;
      }
      echoServer(value);
    }
  } catch (e) {
    setStatus(`Error: ${e.name}: ${e.message}`);
  }
});
