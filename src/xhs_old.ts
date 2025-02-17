export {};

(async () => {
  chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
    console.log(message);
    try {
      await waitForElement(".name-box");
      await waitForElement(".creator-tab");
      await clickCreatorTab();
      await simulateFileUpload(message.imgs);
      await fillTitle(message.title);
      await fillContent(message.content);
      await saveDraft();
      sendResponse(true);
    } catch (error) {
      console.error("流程执行失败:", error);
      sendResponse(false);
    }
    return true;
  });

  const waitForElement = (
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

  const waitForCondition = (
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

  const clickCreatorTab = async () => {
    const creatorTabs =
      document.querySelectorAll<HTMLDivElement>(".creator-tab");
    const creatorTab = creatorTabs[creatorTabs.length - 1];
    creatorTab.click();
  };

  const loadFiles = async (urls: string[]) => {
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

  const simulateFileUpload = async (imgs: string[]) => {
    const files = await loadFiles(imgs);
    const input = (await waitForElement(".upload-input")) as HTMLInputElement;

    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await waitForCondition(() => {
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

  const fillTitle = async (title: string) => {
    const titleInput = await waitForElement(".titleInput input");
    const input = titleInput as HTMLInputElement;
    input.value = title;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await waitForCondition(() => {
      return (
        document.querySelector<HTMLInputElement>(".titleInput input")?.value ===
        title
      );
    });
  };

  const fillContent = async (content: string) => {
    const p = await waitForElement("#quillEditor p");
    p.innerHTML = content;
    p.dispatchEvent(new Event("input", { bubbles: true }));
    await waitForCondition(() => {
      return (
        document.querySelector<HTMLParagraphElement>("#quillEditor p")
          ?.textContent === content
      );
    });
  };

  const saveDraft = async () => {
    const saveDraftButton = await waitForElement(".cancelBtn");
    saveDraftButton.click();
  };
})();
