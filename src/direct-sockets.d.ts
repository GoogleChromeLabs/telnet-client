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

interface SocketOptions {
  sendBufferSize?: number;
  receiveBufferSize? : number;
}

interface TCPSocketOptions extends SocketOptions {
  localAddress?: string;
  localPort?: number;

  noDelay?: boolean;
  keepAlive?: boolean;
  keepAliveDelay?: number;
}

interface SocketCloseOptions {
  force: boolean;
}

interface SocketConnection {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;

  remoteAddress: string;
  remotePort: number;

  localAddress: string;
  localPort: number;
}

type TCPSocketConnection = SocketConnection;

/**
 * TCPSocket interface defined by the Direct Sockets API.
 */
declare class TCPSocket {
  constructor(remoteAddress: string,
              remotePort: number,
              options?: TCPSocketOptions);

  connection: Promise<TCPSocketConnection>;
  closed: Promise<void>;

  close(options?: SocketCloseOptions): Promise<void>;
}
