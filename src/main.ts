/**
 * Copyright 2019 Google LLC
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

import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './style.css';

let hostInput: HTMLInputElement;
let portInput: HTMLInputElement;
let connectButton: HTMLButtonElement;
let echoCheckbox: HTMLInputElement;
let flushOnEnterCheckbox: HTMLInputElement;

let socket: TCPSocket | undefined;
let connection: TCPSocketOpenInfo | undefined;
let reader: ReadableStreamDefaultReader | undefined;

const term = new Terminal({
  scrollback: 10_000,
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
const encoder = new TextEncoder();
let toFlush = '';
term.onData((data) => {
  if (echoCheckbox.checked) {
    term.write(data);
  }

  if (connection?.writable == null) {
    console.warn(`unable to find writable socket`);
    return;
  }

  const writer = connection.writable.getWriter();

  if (flushOnEnterCheckbox.checked) {
    toFlush += data;
    if (data === '\r') {
      writer.write(encoder.encode(toFlush));
      writer.releaseLock();
      toFlush = '';
    }
  } else {
    writer.write(encoder.encode(data));
  }

  writer.releaseLock();
});

/**
 * Download the terminal's contents to a file.
 */
function downloadTerminalContents(): void {
  if (!term) {
    throw new Error('no terminal instance found');
  }

  if (term.rows === 0) {
    console.log('No output yet');
    return;
  }

  term.selectAll();
  const contents = term.getSelection();
  term.clearSelection();
  const linkContent = URL.createObjectURL(
      new Blob([new TextEncoder().encode(contents).buffer],
          {type: 'text/plain'}));
  const fauxLink = document.createElement('a');
  fauxLink.download = `terminal_content_${new Date().getTime()}.txt`;
  fauxLink.href = linkContent;
  fauxLink.click();
}

/**
 * Resets the UI back to the disconnected state.
 */
function markDisconnected(): void {
  term.writeln('<DISCONNECTED>');
  hostInput.disabled = false;
  portInput.disabled = false;
  connectButton.textContent = 'Connect';
  connectButton.disabled = false;
  socket = undefined;
}

/**
 * Initiates a connection to the selected port.
 */
async function connectToServer(): Promise<void> {
  hostInput.disabled = true;
  portInput.disabled = true;
  connectButton.textContent = 'Connecting...';
  connectButton.disabled = true;

  try {
    socket = new TCPSocket(hostInput.value, parseInt(portInput.value));
    connection = await socket.opened;
    term.writeln('<CONNECTED>');
    connectButton.textContent = 'Disconnect';
    connectButton.disabled = false;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      term.writeln(`<ERROR: ${e.message}>`);
    }
    markDisconnected();
    return;
  }

  try {
    reader = connection?.readable.getReader();
    for (;;) {
      const {value, done} = await reader.read();
      if (value) {
        await new Promise<void>((resolve) => {
          term.write(value, resolve);
        });
      }
      if (done) {
        break;
      }
    }
    reader.releaseLock();
    reader = undefined;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      term.writeln(`<ERROR: ${e.message}>`);
    }
  }

  markDisconnected();
}

/**
 * Closes the currently active connection.
 */
async function disconnectFromServer(): Promise<void> {
  // Canceling |reader| will close the connection and cause the read loop in
  // connectToServer() to exit when read() returns with done set to true.
  if (reader) {
    await reader.cancel();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const terminalElement = document.getElementById('terminal');
  if (terminalElement) {
    term.open(terminalElement);
    fitAddon.fit();
  }

  const download = document.getElementById('download') as HTMLSelectElement;
  download.addEventListener('click', downloadTerminalContents);

  connectButton = document.getElementById('connect') as HTMLButtonElement;
  connectButton.addEventListener('click', () => {
    if (socket) {
      disconnectFromServer();
    } else {
      connectToServer();
    }
  });

  hostInput = document.getElementById('host') as HTMLInputElement;
  portInput = document.getElementById('port') as HTMLInputElement;
  echoCheckbox = document.getElementById('echo') as HTMLInputElement;
  flushOnEnterCheckbox =
      document.getElementById('enter_flush') as HTMLInputElement;

  const convertEolCheckbox =
      document.getElementById('convert_eol') as HTMLInputElement;
  const convertEolCheckboxHandler = () => {
    term.setOption('convertEol', convertEolCheckbox.checked);
  };
  convertEolCheckbox.addEventListener('change', convertEolCheckboxHandler);
  convertEolCheckboxHandler();
});
