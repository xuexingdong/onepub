interface PlatformStrategy {
  getHomeUrl(): string;
  isLoggedIn(tab: chrome.tabs.Tab): boolean;
  pub(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void>;
}
