# Telnet Demo

This repository contains an Isolated Web App that allows the user to connect to
a TCP/IP server through an interactive terminal. In other words, a Telnet
client. This provides a demonstration of the [Direct Sockets API].

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

## Enabling the flags

A prototype of Isolated Web Apps is available in Chrome 108.0.5327.0 and later.
At the moment two flags are necessary:

1. Pass `--enable-features=IsolatedWebApps` on the command line or change
   "Enable Isolated Web Apps" on `chrome://flags` to "Enabled".
1. Pass `--isolated-app-origins=http://localhost:8080` on the command line or
   enter `http://localhost:8080` in the box under "Isolated App Origins" on
   `chrome://flags`.

The second flag enables Isolated Web Apps features for apps installed on the
given origins and will be obsolete when this is entirely inferred from the
installation process.

Note that flags must be provided on the command line when the browser first
starts. Once it is running launching it from the command line will open a new
window but command line flags will not take effect. Setting flags on
`chrome://flags` also requries restarting the browser.

## Installing an app

Installing an app is a one-time action, afterwards the browser only needs to be
launched with the flags above.

1. Pass all the flags above.
1. Add `--install-isolated-app-at-startup=http://localhost:8000` on the
   command line or enter `http://localhost:8000` in the box under "Install
   Isolated Apps at Startup" and restart the browser.

This is a temporary interface and will be obsolete when the browser supports
installing apps from within a dedicated "developer mode" UI.

## Launching an app

1. Launch Chrome with the options in "[Enabling the flags](#enabling-the-flags)"
   above.
1. **(ChromeOS)** Click on the launcher or press the "Search" button and search
   for "Telnet".
1. **(Other desktop platforms)** Open `chrome://apps` and look for "Telnet".
1. Click on "Telnet".

[Direct Sockets API]: https://wicg.github.io/direct-sockets/
