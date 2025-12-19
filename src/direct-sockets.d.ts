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

/* https://wicg.github.io/direct-sockets/#dom-tcpsocketoptions */
interface TCPSocketOptions {
  sendBufferSize?: number;
  receiveBufferSize? : number;

  noDelay?: boolean;
  keepAliveDelay?: number;
}

/* https://wicg.github.io/direct-sockets/#dom-tcpsocketopeninfo */
interface TCPSocketOpenInfo {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;

  remoteAddress: string;
  remotePort: number;

  localAddress: string;
  localPort: number;
}

/**
 * https://wicg.github.io/direct-sockets/#dom-tcpsocket
 */
declare class TCPSocket {
  constructor(remoteAddress: string,
              remotePort: number,
              options?: TCPSocketOptions);

  opened: Promise<TCPSocketOpenInfo>;
  closed: Promise<void>;

  close(): Promise<void>;
}

/* https://wicg.github.io/direct-sockets/#dom-tcpserversocketoptions */
interface TCPServerSocketOptions {
  localPort?: number;
  backlog?: number;

  ipv6Only?: boolean;
}

/* https://wicg.github.io/direct-sockets/#dom-tcpserversocketopeninfo */
interface TCPServerSocketOpenInfo {
  readable: ReadableStream<TCPSocket>;

  localAddress: string;
  localPort: number;
}

/**
 * https://wicg.github.io/direct-sockets/#dom-tcpserversocket
 */
declare class TCPServerSocket {
  constructor(localAddress: string,
              options?: TCPServerSocketOptions);

  opened: Promise<TCPServerSocketOpenInfo>;
  closed: Promise<void>;

  close(): Promise<void>;
}
