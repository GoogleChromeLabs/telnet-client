#!/usr/bin/env -S tjs run
// https://github.com/saghul/txiki.js/blob/8460eaedd13225dc2ea6761a8cca7bfd2f06f6b0/tests/test-tcp.js
// https://github.com/saghul/txiki.js/blob/8460eaedd13225dc2ea6761a8cca7bfd2f06f6b0/tests/test-web-streams.js
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const listener = await tjs.listen('tcp', '127.0.0.1', '8000');
const {family, ip, port} = listener.localAddress;
console.log(`Listening on family: ${family}, ip: ${ip}, port: ${port}`);
try {
  const conn = await listener.accept();
  const writer = conn.writable.getWriter();

  await conn.readable.pipeTo(new WritableStream({
    async write(value, controller) {
      const data = decoder.decode(value);
      console.log(data);
      await writer.write(value);
    },
    close() {
      console.log('Stream closed');
    },
    abort(reason) {
      console.log(reason);
    }
  })).then(() => console.log('Stream aborted')).catch((e) => {
    throw e;
  });
} catch (e) {
  console.log(e);
  listener.close();
}
