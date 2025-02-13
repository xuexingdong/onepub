chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  console.log(message);
  await waitForElement(".name-box");
  await waitForElement(".creator-tab");
  clickCreatorTab();
  simulateFileUpload(message.imgs);
  fillTitle(message.title);
  fillContent(message.content);
  saveDraft();
  sendResponse(true);
  return true;
});
const waitForElement = (selector: string): Promise<HTMLElement> => {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((_) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

const waitForElements = (selector: string): Promise<HTMLElement[]> => {
  return new Promise<HTMLElement[]>((resolve) => {
    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      if (elements.length > 0) {
        observer.disconnect();
        resolve(Array.from(elements));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};
console.log(waitForElements);

const loadFiles = async (urls: string[]) => {
  const files = [];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], url.substring(url.lastIndexOf("/") + 1), {
        type: blob.type,
      });
      files.push(file);
    } catch (error) {
      console.error(`Error loading ${url}:`, error);
    }
  }
  return files;
};

const simulateFileUpload = async (imgs: string[]) => {
  loadFiles(imgs)
    .then((files) => {
      const input = document.querySelector<HTMLInputElement>(".upload-input");
      if (input) {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => {
          dataTransfer.items.add(file);
        });
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    })
    .catch((error) => {
      console.error("Error loading file:", error);
    });
};
const clickCreatorTab = () => {
  const creatorTabs = document.querySelectorAll<HTMLDivElement>(".creator-tab");
  const creatorTab = creatorTabs[creatorTabs.length - 1];
  creatorTab.click();
};

const fillTitle = (title: string) => {
  waitForElement(".titleInput input").then((titleInput) => {
    const input = titleInput as HTMLInputElement;
    input.value = title;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const fillContent = (content: string) => {
  waitForElement(".ql-editor p").then((p) => {
    p.innerHTML = content;
  });
};

const saveDraft = () => {
  waitForElement(".cancelBtn").then((element) => {
    console.log(1111);
    element.click();
  });
};
