// 监听外部消息
chrome.runtime.onMessageExternal.addListener(
  async (message, _, sendResponse) => {
    chrome.tabs.create(
      {
        url: "https://creator.xiaohongshu.com/publish/publish",
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

            chrome.scripting.executeScript(
              {
                target: { tabId: tabId },
                files: ["xhs.js"],
              },
              () => {
                chrome.tabs.sendMessage(tabId, message);
                sendResponse({ success: true });
              }
            );
          }
        };

        // 添加监听器
        chrome.tabs.onUpdated.addListener(handleTabUpdate);
      }
    );

    // 保持消息通道开放
    return true;
  }
);
