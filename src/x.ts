class XStrategy implements PlatformStrategy {
  pub(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getHomeUrl(): string {
    return "https://x.com/home";
  }
  isLoggedIn(tab: chrome.tabs.Tab): boolean {
    if (!tab.url) {
      return false;
    }
    return tab.url.includes("logout");
  }
}

export default XStrategy;
