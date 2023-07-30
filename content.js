const xpathsToToggle = [
  "/html/body/div[1]/div/div/div[1]/div/div[1]/div[3]/div/div[2]/span/span", // xpath for notification badge
  "//*[@id='__next']/div/div/div[1]/div/div[1]/div[3]/div/div[1]/span/span", // xpath for message badge
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]" // xpath for posts on feed
];

function toggleElements(xpathExpressions, shouldHide) {
  xpathExpressions.forEach(xpathExpression => {
    const xpathResult = document.evaluate(xpathExpression, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    let element = xpathResult.iterateNext();

    while (element) {
      element.style.display = shouldHide ? "none" : ""; 
      element = xpathResult.iterateNext();
    }
  });
}

function toggleAndSyncElements() {
  chrome.storage.sync.get("hideElements", function (data) {
    const shouldHide = !data.hideElements;
    chrome.storage.sync.set({ hideElements: shouldHide });
    toggleElements(xpathsToToggle, shouldHide);

    // Send a message to other tabs to update their state
    chrome.runtime.sendMessage({ hideElements: shouldHide });
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === "toggle_element") {
    toggleAndSyncElements();
  }
});

chrome.storage.sync.get("hideElements", function (data) {
  toggleElements(xpathsToToggle, data.hideElements);
});
