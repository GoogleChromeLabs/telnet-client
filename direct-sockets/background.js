let nativeMessagingPort;
let {
  resolve,
  reject,
  promise
} = Promise.withResolvers();

chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  const sdp = await promise;
  sendResponse(sdp);
});

chrome.runtime.onConnectExternal.addListener(async (port) => {
  if (port.name === 'IWA') {
    port.onMessage.addListener((sdp) => {
      nativeMessagingPort = chrome.runtime.connectNative('nm_tjs');
      nativeMessagingPort.onMessage.addListener((message) => {
        port.postMessage(message);
        resolve(sdp);
      });
      nativeMessagingPort.onDisconnect.addListener((nativePort) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
        }
        console.log(nativePort.name, 'Disconnected');
      });
      nativeMessagingPort.postMessage(null);
    });
    port.onDisconnect.addListener(() => {
      nativeMessagingPort.disconnect();
    });
  }
});

chrome.windows.onCreated.addListener(async (window) => {
  if (window.type === 'app') {
    await chrome.windows.update(args.id, {
      state: 'minimized',
      drawAttention: false
    });
  }
});

chrome.runtime.onInstalled.addListener(async (reason) => {
  const [{
    id
  }] = await chrome.windows.getAll({
    windowTypes: ['app']
  });
  await chrome.windows.remove(id);
});
