#!/usr/bin/env -S node --experimental-default-type=module

import {
  createServer
} from 'node:net';

const abortable = new AbortController();
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const {
  signal
} = abortable;

const server = createServer({
  highWaterMark: 0,
  allowHalfOpen: true,
  noDelay: true
}, (socket) => {

  socket.on('data', (data) => {
    const response = decoder.decode(data).toUpperCase();
    console.log(data, response);
    socket.write(encoder.encode(response), null, () => {
      console.log('data written');
    });
  });

  socket.on('end', () => {
    console.log('Socket closed.');
    server.close();
  });

  socket.on('drain', (data) => {
    console.log('drain');
  });

  socket.on('error', (err) => {
    console.log({
      err
    });
  });

});

server.on('error', (e) => {
  console.log({
    e
  });
});

server.listen({
  port: 8000,
  host: '0.0.0.0',
  signal
}, () => {
  const {
    address,
    family,
    port
  } = server.address();
  console.log(`Listening on family: ${family}, address: ${address}, port: ${port}`);
});
