# Telnet Demo

This repository contains an Isolated Web App that allows the user to connect to
a TCP/IP server through an interactive terminal. In other words, a Telnet
client. This provides a demonstration of the [Direct Sockets API].

This demo is supported in Chrome 105.0.5193.0 and later.

## Privacy

This application is served statically and is cached for offline use. No
analytics are collected. All communication is directly between the client and
the remote server specified by the user.

## Building

This project is written in TypeScript and uses npm and Webpack to manage
dependencies and automate the build process. To get started clone the
repository and install dependencies by running,

```sh
npm install
```

To create a production build in the `dist` folder run,

```sh
npm run build
```

To start a local development server on port 8080 run,

```sh
npm start
```

Webpack's automatic reloading will not work because it does not support Trusted
Types.

## Running

1. Launch Chrome with `--isolated-app-origins=http://localhost:8080` or visit
   `chrome://flags#isolated-app-origins`, enter `http://localhost:8080` in
   the box provided and click "Restart".
1. Navigate to `http://localhost:8080`.
1. Click the "Install" button in the omnibox.
1. Close the app window (it isn't running as an Isolated App yet).
1. Navigate to `chrome://apps`.
1. Click on "Telnet".

[Direct Sockets API]: https://wicg.github.io/direct-sockets/
