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

[Direct Sockets API]: https://wicg.github.io/direct-sockets/
