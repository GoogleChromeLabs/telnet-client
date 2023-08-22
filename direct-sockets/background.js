chrome.runtime.onConnectExternal.addListener(async (port) => {
    console.log(port);
    port.onMessage.addListener((_) => {
        console.log(_);
        nativeMessagingPort = chrome.runtime.connectNative('nm_tjs');
        nativeMessagingPort.onMessage.addListener((message) => {
            console.log(message);
            port.postMessage(message);
        });
        nativeMessagingPort.onDisconnect.addListener((_) => {
            console.log('Disconnected', _);
        });
        nativeMessagingPort.postMessage(null);
    });
    port.onDisconnect.addListener(() => {
        nativeMessagingPort.disconnect();
    });
});
