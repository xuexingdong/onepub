let URL_MAP = new Map([
  ["xiaohongshu", "https://creator.xiaohongshu.com/publish/publish"],
  ["x", "https://x.com/"],
]);

chrome.runtime.onMessageExternal.addListener(
  async (message, _, sendResponse) => {
    if (!message.platforms) {
      sendResponse(true);
      return;
    }
    for (var platform in message.platforms) {
      chrome.tabs.create(
        {
          url: URL_MAP.get(platform),
          active: false,
        },
        (tab) => {
          const tabId = tab.id;
          if (!tabId) {
            return true;
          }
          const handleTabUpdate = (
            updatedTabId: any,
            changeInfo: any,
            updatedTab: any
          ) => {
            if (updatedTabId === tabId && changeInfo.status === "complete") {
              // 立即移除监听器确保只执行一次
              chrome.tabs.onUpdated.removeListener(handleTabUpdate);

              if (updatedTab.url?.includes("login")) {
                chrome.tabs.remove(tabId);
                sendResponse({ success: false, message: "小红书未登录" });
                return;
              }
              chrome.tabs.sendMessage(tabId, message);
              sendResponse({ success: true });
              // chrome.scripting.executeScript(
              //   {
              //     target: { tabId: tabId },
              //     files: ["xhs.js"],
              //   },
              //   () => {
              //     chrome.tabs.sendMessage(tabId, message);
              //     sendResponse({ success: true });
              //   }
              // );
            }
          };
          chrome.tabs.onUpdated.addListener(handleTabUpdate);
        }
      );
    }

    return true;
  }
);
