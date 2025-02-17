import XStrategy from "./x";
import XhsStrategy from "./xhs";

export {};

(async () => {
  const PLATFORM_STRATEGIES = new Map<string, PlatformStrategy>([
    ["xhs", new XhsStrategy()],
    ["x", new XStrategy()],
  ]);
  let pluginWindowId: number;
  const crateWindowIfNotExist = () => {
    if (!pluginWindowId) {
      chrome.windows.create(
        {
          type: "normal",
          state: "maximized",
        },
        (window) => {
          if (window?.id) {
            pluginWindowId = window.id;
          }
        }
      );
    }
  };
  const closeWindow = () => {
    chrome.windows.remove(pluginWindowId);
  };

  chrome.runtime.onMessageExternal.addListener(
    async (message, _, sendResponse) => {
      if (!message.platforms) {
        sendResponse(true);
        return true;
      }
      crateWindowIfNotExist();
      for (let platform in message.platforms) {
        const platformStrategy = PLATFORM_STRATEGIES.get(platform);
        if (!platformStrategy) {
          continue;
        }
        chrome.tabs.create(
          {
            url: platformStrategy?.getHomeUrl(),
            active: false,
            windowId: pluginWindowId,
          },
          (tab) => {
            const tabId = tab.id;
            if (!tabId) {
              return;
            }
            const handleTabUpdate = (
              updatedTabId: any,
              changeInfo: any,
              updatedTab: any
            ) => {
              if (updatedTabId === tabId && changeInfo.status === "complete") {
                // remove listener to ensure only invoke once
                chrome.tabs.onUpdated.removeListener(handleTabUpdate);
                if (!platformStrategy.isLoggedIn(updatedTab)) {
                  chrome.tabs.remove(tabId);
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
      closeWindow();
      sendResponse(true);
      return true;
    }
  );
})();
