(async () => {
    globalThis.handle = null;
    globalThis.encoder = new TextEncoder();
    globalThis.decoder = new TextDecoder();
    globalThis.socket = null;
    globalThis.abortable = new AbortController();
    const {
      signal
    } = abortable;
    globalThis.signal = signal;
    globalThis.readable = null;
    globalThis.writable = null;
    globalThis.writer = null;
    globalThis.stream = null;
    globalThis.local = null;
    globalThis.channel = null;
    globalThis.port = chrome.runtime.connect('<ID>', {
      name: 'IWA'
    });
    onbeforeunload = () => port.disconnect();
    Object.assign(globalThis, Promise.withResolvers());
    port.onMessage.addListener(async (message) => {
      console.log(message);
      if (message === 'Listening on family: 2, ip: 127.0.0.1, port: 8000') {
        globalThis.socket = new TCPSocket('0.0.0.0', '8000');
        globalThis.stream = await socket.opened.catch(console.log);
        globalThis.readable = stream.readable;
        globalThis.writable = stream.writable;
        globalThis.writer = writable.getWriter();
        globalThis.socket.closed.then(() => console.log('Socket closed')).catch(() => console.warn('Socket error'));
        globalThis.readable.pipeThrough(new TextDecoderStream()).pipeTo(
          new WritableStream({
            start(controller) {
              console.log('Starting TCP stream.');
            },
            write(v) {
              console.log(v);
              globalThis.channel.send(v);
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
        resolve();
      }
    });
    port.postMessage(null);
    await promise;
    const sdp = atob(new URL(location.href).searchParams.get('sdp'));
    local = new RTCPeerConnection({
      sdpSemantics: 'unified-plan',
    });
    [
      'onsignalingstatechange',
      'oniceconnectionstatechange',
      'onicegatheringstatechange',
    ].forEach((e) => local.addEventListener(e, console.log));
  
    local.onicecandidate = async ({candidate}) => {
      if (!candidate) {
        try {
          await navigator.permissions.request({
            name: 'notifications'
          });
          new Notification('IWA: Save SDP?').onclick = async () => {
            globalThis.handle = await showSaveFilePicker({
              suggestedName: 'sdp.txt',
              startIn: 'downloads'
            });
            await new Blob([btoa(local.localDescription.sdp)], {
              type: 'text/plain'
            }).stream().pipeTo(await globalThis.handle.createWritable({
              keepExistingData: false
            }));
          };
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
    };
    channel.onclosing = async (e) => {
      console.log(e.type);
    };
    channel.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      switch (data.type) {
        case 'close':
          channel.close();
          local.close();
          await writer.close().catch(console.log);
          abortable.abort('reason');
          close();
          break;
        case 'echo':
          channel.send(data.message.toUpperCase());
          break;
        case 'write':
          await writer.write(encoder.encode(data.message)).catch(console.log);
          break;
        default:
          console.log(e);
          break;
      }
    };
    await local.setRemoteDescription({
      type: 'offer',
      sdp
    });
    await local.setLocalDescription(await local.createAnswer());
  })();