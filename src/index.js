(async () => {
    resizeTo(100, 100);
    globalThis.encoder = new TextEncoder();
    globalThis.decoder = new TextDecoder();
  
    globalThis.abortable = new AbortController();
    const {
      signal
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
    globalThis.socket = new TCPSocket('0.0.0.0', '8000');
    globalThis.stream = await socket.opened.catch(console.log);
    globalThis.readable = stream.readable;
    console.log(socket);
    globalThis.writable = stream.writable;
    globalThis.writer = writable.getWriter();
    globalThis.socket.closed.then(() => console.log('Socket closed')).catch(() => console.warn('Socket error'));
    globalThis.readable.pipeThrough(new TextDecoderStream()).pipeTo(
      new WritableStream({
        start(controller) {
          console.log('Starting TCP stream.');
        },
        write(value) {
          globalThis.channel.send(value);
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
      }).then(() => console.log('pipeThrough, pipeTo Promise')).catch(() => console.log('caught'));
  
    const sdp = atob(new URL(location.href).searchParams.get('sdp'));
    local = new RTCPeerConnection({
      sdpSemantics: 'unified-plan',
    });
    [
      'onsignalingstatechange',
      'oniceconnectionstatechange',
      'onicegatheringstatechange',
    ].forEach((e) => local.addEventListener(e, console.log));
  
    local.onicecandidate = async ({
      candidate
    }) => {
      if (!candidate) {
        try {
          new Notification('IWA: Save SDP for WebRTC Data Channel')
            .onclick = async () => {
              globalThis.handle = await showSaveFilePicker({
                suggestedName: 'sdp.txt',
                startIn: 'downloads'
              });
              await new Blob([btoa(local.localDescription.sdp)], {
                type: 'text/plain'
              }).stream().pipeTo(await globalThis.handle.createWritable({
                keepExistingData: false
              }));
              blur();
            }
        } catch (e) {
          console.error(e);
        }
      }
    };
    channel = local.createDataChannel('transfer', {
      negotiated: true,
      ordered: true,
      id: 0,
      binaryType: 'arraybuffer',
      protocol: 'tcp',
    });
  
    channel.onopen = async (e) => {
      console.log(e.type);
    };
    channel.onclose = async (e) => {
      console.log(e.type);
      local.close();
      await writer.close().catch(console.log);
      abortable.abort('reason');
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
      type: 'offer',
      sdp
    });
    await local.setLocalDescription(await local.createAnswer());
  })();