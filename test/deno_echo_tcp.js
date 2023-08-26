#!/usr/bin/env -S deno run -A
// https://deno.land/manual@v1.36.1/examples/tcp_echo
const encoder = new TextEncoder();
const listener = Deno.listen({
  port: 8000
});
const {hostname, port, transport} = listener.addr;
console.log(`Listening on hostname: ${hostname}, port: ${port}, transport: ${transport}`);
const abortable = new AbortController();
const {
  signal
} = abortable;
for await (const conn of listener) {
  try {
    const {
      readable,
      writable
    } = conn;
    const writer = writable.getWriter();
    await readable.pipeThrough(new TextDecoderStream(), {
      signal
    }).pipeTo(new WritableStream({
      async write(value, controller) {
        console.log(value);
        await writer.write(encoder.encode(value.toUpperCase()));
      },
      close() {
        console.log('Stream closed');
      },
      abort(reason) {
        console.log({
          reason
        });
      }
    })).then(() => {
      throw new Error('Stream aborted')
    }) 
  } catch (e) {
    console.log({
      e
    });
    break;
  }
}
try {
  listener.unref();
} catch (err) {
  console.log({
    err
  });
}
