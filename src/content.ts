const imgs = [
  "https://fe-static.xhscdn.com/formula-static/ugc/public/img/xy_emotion_redclub_haixiu.ae77ab0.png",
  "https://fe-static.xhscdn.com/formula-static/ugc/public/img/xy_emotion_redclub_haixiu.ae77ab0.png",
];
const title = "Onepub标题";
const content = "Onepub正文";
const baiduButton = document.getElementById("su");
if (baiduButton) {
  baiduButton.addEventListener("click", async () => {
    console.log("Recently clicked 点击事件");
    // 后续这段代码对接到自己的saas系统中
    chrome.runtime.sendMessage(
      { imgs: imgs, title: title, content: content },
      (response) => {
        console.log(response.success);
      }
    );
  });
}
