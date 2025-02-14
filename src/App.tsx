import { useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("默认标题");
  const [content, setContent] = useState("默认内容");
  const [files, setFiles] = useState<string[]>([
    "https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31c589sekgk6g5p9cketqo4smatcmvog?imageView2/2/w/80/format/jpg",
    "https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31c589sekgk6g5p9cketqo4smatcmvog?imageView2/2/w/80/format/jpg", // 默认图片URL（简短且展示小型图片）
  ]);

  const detectExtension = () => {
    if (!chrome.runtime) {
      alert("未安装Onepub扩展");
      return;
    }

    chrome.runtime.sendMessage(
      "bjnliimjinnkiccnnonpmbnnfddikgpn",
      { imgs: files, title: title, content: content },
      (response) => {
        if (chrome.runtime.lastError) {
          alert("未启用Onepub扩展");
          return;
        }
        if (!response.success) {
          alert(response.message);
        }
      }
    );
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target as HTMLTextAreaElement;
    const urls = input.value.split(/[\s\n]/).filter((url) => url.trim() !== "");
    setFiles(urls);
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">Onepub 测试页面</h1>
        <div className="input-group">
          <label className="label" htmlFor="title">
            标题：
          </label>
          <input
            type="text"
            id="title"
            className="input-field"
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        <div className="input-group">
          <label className="label" htmlFor="content">
            内容：
          </label>
          <input
            type="text"
            id="content"
            className="input-field"
            value={content}
            onChange={handleContentChange}
          />
        </div>
        <div className="input-group">
          <label className="label" htmlFor="file">
            图片，每行一个URL
          </label>
          <textarea
            id="fileInput"
            className="input-field"
            rows={4}
            placeholder="请输入图片URL，每行一个"
            value={files.join("\n")}
            onChange={handleFileChange}
          />
        </div>
        <div className="button-group">
          <button className="submit-button" onClick={detectExtension}>
            发布小红书
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
