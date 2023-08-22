#!/usr/bin/env -S /home/user/txiki.js/build/tjs run
// txiki.js Native Messaging host
// guest271314, 2-10-2023

// https://github.com/denoland/deno/discussions/17236#discussioncomment-4566134
// https://github.com/saghul/txiki.js/blob/master/src/js/core/tjs/eval-stdin.js
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function readFullAsync(length) {
    const buffer = new Uint8Array(65536);
    const data = [];
    while (data.length < length) {
        const n = await tjs.stdin.read(buffer);
        if (n === null) {
            break;
        }
        data.push(...buffer.subarray(0, n));
    }
    return new Uint8Array(data);
}

async function getMessage() {
    const header = new Uint8Array(4);
    await tjs.stdin.read(header);
    const [length] = new Uint32Array(
        header.buffer
    );
    const output = await readFullAsync(length);
    return output;
}

async function sendMessage(message) {
    // https://stackoverflow.com/a/24777120
    const header = Uint32Array.from({
        length: 4,
    },
        (_, index) => (message.length >> (index * 8)) & 0xff
    );
    const output = new Uint8Array(header.length + message.length);
    output.set(header, 0);
    output.set(message, 4);
    await tjs.stdout.write(output);
    return true;
}

function encodeMessage(message) {
    return encoder.encode(JSON.stringify(message));
}

async function tcpServer() {
    const listener = await tjs.listen('tcp', '127.0.0.1', '8000');
    const {
        family,
        ip,
        port
    } = listener.localAddress;
    sendMessage(encodeMessage(`Listening on family: ${family}, ip: ${ip}, port: ${port}`));
    try {
        const conn = await listener.accept();
        const writer = conn.writable.getWriter();

        return await conn.readable.pipeTo(new WritableStream({
            async write(value, controller) {
                const data = decoder.decode(value);
                //sendMessage(encodeMessage(data));
                await writer.write(encoder.encode(data.toUpperCase()));
            },
            close() {
                sendMessage(encodeMessage('Stream closed'));
            },
            abort(reason) {
                sendMessage(encodeMessage(reason));
            }
        })).then(() => sendMessage(encodeMessage('Stream aborted'))).catch((e) => {
            throw e;
        });
    } catch (e) {
        sendMessage(encodeMessage(e));
        listener.close();
    }
}

async function main() {
    try {
        while (true) {
            const message = await getMessage();
            // await sendMessage(message);
            await tcpServer();
        }
    } catch (e) {
        await sendMessage(encodeMessage(e));
        tjs.exit();
    }
}

main();