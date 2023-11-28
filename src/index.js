onload = async () => {
  const permission = await navigator.permissions.request({
    name: "notifications",
  });
  resizeTo(300, 200);
  globalThis.encoder = new TextEncoder();
  globalThis.decoder = new TextDecoder();

  globalThis.abortable = new AbortController();
  const {
    signal,
  } = abortable;
  globalThis.signal = signal;
  globalThis.handle = null;
  globalThis.socket = null;
  globalThis.readable = null;
  globalThis.writable = null;
  globalThis.writer = null;
  globalThis.stream = null;
  globalThis.local = null;
  globalThis.channel = null;
  const sdp = atob(new URL(location.href).searchParams.get("sdp"));
  local = new RTCPeerConnection({
    sdpSemantics: "unified-plan",
  });
  [
    "onsignalingstatechange",
    "oniceconnectionstatechange",
    "onicegatheringstatechange",
  ].forEach((e) => local.addEventListener(e, console.log));

  local.onicecandidate = async ({
    candidate,
  }) => {
    if (!candidate) {
      try {
        new Notification("IWA: Save SDP for WebRTC Data Channel")
          .onclick = async () => {
            [globalThis.handle] = await showOpenFilePicker({
              types: [
                {
                  description: "SDP",
                  accept: {
                    "application/sdp": [".sdp"],
                  },
                },
              ],
              excludeAcceptAllOption: true,
              multiple: false,
            });
            await new Blob([btoa(local.localDescription.sdp)], {
              type: "application/sdp",
            }).stream().pipeTo(
              await globalThis.handle.createWritable({
                keepExistingData: true,
              }),
            );
            blur();
            try {
              globalThis.socket = new TCPSocket("0.0.0.0", "8000");
              globalThis.stream = await socket.opened;
              globalThis.readable = stream.readable;
              console.log(socket);
            } catch (e) {
              console.log(e);
            }
            document.title = "TCPSocket";
            const { localAddress, localPort, remoteAddress, remotePort } =
              globalThis.stream;
            document.body.textContent = JSON.stringify(
              { localAddress, localPort, remoteAddress, remotePort },
              null,
              2,
            );
            globalThis.writable = stream.writable;
            globalThis.writer = writable.getWriter();
            globalThis.socket.closed.then(() => console.log("Socket closed"))
              .catch(() => console.warn("Socket error"));
            globalThis.readable.pipeThrough(new TextDecoderStream()).pipeTo(
              new WritableStream({
                start(controller) {
                  console.log("Starting TCP stream.");
                },
                write(value) {
                  globalThis.channel.send(value);
                },
                close() {
                  console.log("Socket closed");
                },
                abort(reason) {
                  console.log({
                    reason,
                  });
                },
              }),
              {
                signal,
              },
            ).then(() => console.log("pipeThrough, pipeTo Promise")).catch(() =>
              console.log("caught")
            );
          };
      } catch (e) {
        console.error(e);
      }
    }
  };
  channel = local.createDataChannel("transfer", {
    negotiated: true,
    ordered: true,
    id: 0,
    binaryType: "arraybuffer",
    protocol: "tcp",
  });

  channel.onopen = async (e) => {
    console.log(e.type);
  };
  channel.onclose = channel.onerror = async (e) => {
    console.log(e.type);
    local.close();
    await writer.close().catch(console.log);
    abortable.abort("reason");
    close();
  };
  channel.onclosing = async (e) => {
    console.log(e.type);
  };
  channel.onmessage = async (e) => {
    console.log(e.data);
    await writer.write(e.data).catch(console.log);
  };
  await local.setRemoteDescription({
    type: "offer",
    sdp,
  });
  await local.setLocalDescription(await local.createAnswer());
};

