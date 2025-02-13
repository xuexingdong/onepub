// 监听外部消息
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    console.log("插件收到外部消息:", message, sender);
    sendResponse({ message: "插件已安装" });
  }
);

chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
  chrome.tabs.create(
    {
      url: "https://creator.xiaohongshu.com/publish/publish",
      active: false,
    },
    (tab) => {
      if (tab.id) {
        const tabId = tab.id;
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["xhs.js"],
          },
          () => {
            chrome.tabs.sendMessage(tabId, message);
          }
        );
      }
    }
  );
});
