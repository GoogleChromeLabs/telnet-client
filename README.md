# Telnet Demo

This repository contains an
[Isolated Web App](https://github.com/WICG/isolated-web-apps/blob/main/README.md)
that allows the user to connect to a TCP/IP server through an interactive
terminal. In other words, a Telnet client. This provides a demonstration of
the [Direct Sockets API].

## Privacy

This application is served statically and is cached for offline use. No
analytics are collected. All communication is directly between the client and
the remote server specified by the user.

## Building

This project is written in TypeScript and uses npm or `bun` and Webpack to manage
dependencies and automate the build process. To get started clone the
repository and install dependencies by running,

```sh
npm install
```

or 

```sh
bun install
```

Chrome supports two options for Isolated Web App development. In "proxy" mode
you run a local development server as you would for normal web app development
on a URL like `http://localhost:8080`. When the app is installed a random
`isolated-app://` origin is created and the browser proxies requests for this
origin to your local server. This allows you to quickly edit and refresh the
app to see your changes. When developer mode is enabled Chrome also allows you
to self-sign a Web Bundle and load it as it would be for a production app.

These instructions have been tested on Chrome 110.0.5464.2. When developing an
Isolated Web App always make sure you are running the latest version of Chrome
dev-channel as the feature is under active development.

### Running with a local development server

To start a local development server run,

```sh
npm run start
```

or

```sh
bun run start
```

The server is listening on `http://localhost:8080`. The next step is to launch
Chrome to install the app in "proxy" mode,

```sh
google-chrome-unstable --enable-features=IsolatedWebApps,IsolatedWebAppDevMode \
                       --install-isolated-web-app-from-url=http://localhost:8080
```

If you visit `chrome://apps` you will see a new app called "Telnet".

After installation you can remove the `--install-isolated-web-app-from-url`
parameter from the command line.

Note that flags must be provided on the command line when the browser first
starts. Once it is running launching it from the command line will open a new
window but command line flags will not take effect.

Webpack's automatic reloading will not work because it does not support Trusted
Types.

### Building a Signed Web Bundle

Signing a Web Bundle requires generating a private key. This only needs to be
done once,

```sh
openssl genpkey -algorithm ed25519 -out private.pem
```

To build,

```sh
npm run build
```

or 
bun run build
```

This will generate `dist/telnet.swbn`, a Web Bundle signed with the development
key generated above.

To install this bundle as an Isolated Web App, launch Chrome with the following
flags,

```sh
google-chrome-unstable --enable-features=IsolatedWebApps,IsolatedWebAppDevMode \
                       --install-isolated-web-app-from-file=$PWD/dist/telnet.swbn
```

If you visit `chrome://apps` you will see a new app called "Telnet".

After installation you can remove the `--install-isolated-web-app-from-file`
parameter from the command line.

Note that flags must be provided on the command line when the browser first
starts. Once it is running launching it from the command line will open a new
window but command line flags will not take effect.

### Local testing

The `test` folder contains a [Deno](https://github.com/denoland/deno) TCP server `deno_echo_tcp.js`, a [txiki.js](https://github.com/saghul/txiki.js) TCP server `txikijs_echo_tcp.js`, and a Node.js TCP server `node_echo_tcp.mjs`.

To test locally start the local TCP server of your choice then at `console` of the Telnet Client example, or in the signed Web Bundle code run something like this

```
var socket = new TCPSocket('0.0.0.0', '8000');
var abortable = new AbortController();
var {
  signal
} = abortable;
var {
  readable,
  writable
} = await socket.opened;
var controller;
socket.closed.then(() => console.log('Socket closed'))
  .catch(() => console.warn('Socket error'));
readable.pipeThrough(new TextDecoderStream()).pipeTo(
    new WritableStream({
      start(c) {
        return controller = c;
      },
      write(value) {
        console.log(value);
      },
      close() {
        console.log('Socket closed');
      },
      abort(reason) {
        console.log({
          reason
        });
      }
    }), {
      signal
    })
  .then(() => console.log('pipeTo() Promise fulfilled'))
  .catch(() => console.log('pipeTo() Promise error caught'));

var encoder = new TextEncoder();
var enc = (text) => encoder.encode(text);
var writer = writable.getWriter();
writer.closed.then(() => console.log('writer closed'))
  .catch(() => console.log('writer closed error'));

await writer.write(enc('yo'));
// For responses to be discrete when reading
await new Promise((r) => setTimeout(r, 20));

// Write to the TCP socket
await writer.write(enc('Test DirectSockets'));
// For responses to be discrete when reading
await new Promise((r) => setTimeout(r, 20));

// Close the WritableStreamDefaultWriter
// This _does not_ close the TCP connection
await writer.close().then(() => console.log('writer.close()'))
.catch(() => console.log('writer.close() error'));

// Close the TCP connection
abortable.abort('Done testing DirectSockets');
```

To launch the IWA `window` from an arbitrary Web page in DevTools `console` or Snippets run the code in https://github.com/guest271314/telnet-client/blob/user-defined-tcpsocket-controller-web-api/direct-sockets/direct-socket-controller.js.

Watch for the `open` event then run something like the following which should print the values echoed back in uppercase

```
for (let char of 'abcdefghijklmnopqrstuvwxyz') {
  channel.send(encoder.encode(char));
}
```

[Direct Sockets API]: https://wicg.github.io/direct-sockets/
