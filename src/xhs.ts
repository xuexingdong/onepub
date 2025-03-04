class XhsStrategy implements PlatformStrategy {
  waitForElement = (
    selector: string,
    condition?: (element: HTMLElement) => boolean,
    timeout: number = 30 * 1000
  ): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      let element = document.querySelector<HTMLElement>(selector);
      if (element && (!condition || condition(element))) {
        return resolve(element);
      }
      const observer = new MutationObserver(() => {
        element = document.querySelector<HTMLElement>(selector);
        if (element && (!condition || condition(element))) {
          observer.disconnect();
          resolve(element);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });

      if (timeout) {
        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  };

  waitForCondition = (
    condition: () => boolean,
    timeout: number = 30 * 1000
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        if (condition()) {
          observer.disconnect();
          resolve(true);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });
      if (timeout) {
        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  };

  clickCreatorTab = async () => {
    const creatorTabs =
      document.querySelectorAll<HTMLDivElement>(".creator-tab");
    const creatorTab = creatorTabs[creatorTabs.length - 1];
    creatorTab.click();
  };

  loadFiles = async (urls: string[]) => {
    return Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], url.substring(url.lastIndexOf("/") + 1), {
          type: blob.type,
        });
      })
    );
  };

  simulateFileUpload = async (imgs: string[]) => {
    const files = await this.loadFiles(imgs);
    const input = (await this.waitForElement(
      ".upload-input"
    )) as HTMLInputElement;

    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await this.waitForCondition(() => {
      const formatImgs = document.querySelectorAll<HTMLElement>(
        ".img-preview-area .format-img"
      );
      const hasPrerender =
        document.querySelector(".img-preview-area .prerender") !== null;
      const hasUploading =
        document.querySelector(".img-preview-area .uploading") !== null;
      return (
        formatImgs.length === files.length && !hasPrerender && !hasUploading
      );
    });
  };

  fillTitle = async (title: string) => {
    const titleInput = await this.waitForElement(".titleInput input");
    const input = titleInput as HTMLInputElement;
    input.value = title;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await this.waitForCondition(() => {
      return (
        document.querySelector<HTMLInputElement>(".titleInput input")?.value ===
        title
      );
    });
  };

  fillContent = async (content: string) => {
    const p = await this.waitForElement("#quillEditor p");
    p.innerHTML = content;
    p.dispatchEvent(new Event("input", { bubbles: true }));
    await this.waitForCondition(() => {
      return (
        document.querySelector<HTMLParagraphElement>("#quillEditor p")
          ?.textContent === content
      );
    });
  };

  saveDraft = async () => {
    const saveDraftButton = await this.waitForElement(".cancelBtn");
    saveDraftButton.click();
  };
  getHomeUrl(): string {
    return "https://creator.xiaohongshu.com/publish/publish";
  }
  isLoggedIn(tab: chrome.tabs.Tab): boolean {
    if (!tab.url) {
      return false;
    }
    return tab.url.includes("login");
  }

  async pub(
    message: any,
    _: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    console.log(message);
    try {
      await this.waitForElement(".name-box");
      await this.waitForElement(".creator-tab");
      await this.clickCreatorTab();
      await this.simulateFileUpload(message.imgs);
      await this.fillTitle(message.title);
      await this.fillContent(message.content);
      await this.saveDraft();
      sendResponse(true);
    } catch (error) {
      console.error("流程执行失败:", error);
      sendResponse(false);
    }
  }
}

export default XhsStrategy;
