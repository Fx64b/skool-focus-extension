function toggleElement() {
    chrome.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        if (tab.favIconUrl && tab.url.includes("skool.com")) {
          chrome.tabs.sendMessage(tab.id, { message: "toggle_element" });
        }
      }
    });
  }
  
  chrome.action.onClicked.addListener(function (tab) {
    toggleElement();
  });
  
  // Listen for messages from the content script or other tabs to toggle elements
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.message === "toggle_element") {

      // Send a message to all open tabs to toggle elements
      chrome.tabs.query({}, function (tabs) {
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { hideElements: message.hideElements });
        }
      });
    }
  });
  