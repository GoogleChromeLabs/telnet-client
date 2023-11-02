globalThis.name = chrome.runtime.getManifest().short_name;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.title === "TCPSocket") {
    console.log(changeInfo.title);
    const[{ id }] = await chrome.windows.getAll({
      populate: true,
      windowTypes: ["app"],
    });
    await chrome.windows.update(id, {focused: false});
  }
});

chrome.windows.onCreated.addListener(async ({ type, id }) => {
  console.log("Isolated App open", { type, id });
  globalThis.port = chrome.runtime.connectNative(globalThis.name);
  port.onMessage.addListener((message) => console.log(message));
  port.onDisconnect.addListener(() => console.log(chrome.runtime.lastError));
}, { windowTypes: ["app"] });

chrome.windows.onRemoved.addListener((id) => {
  console.log("Isolated App closed", id);
  if (globalThis.port) {
    globalThis.port.disconnect();
  }
}, { windowTypes: ["app"] });
