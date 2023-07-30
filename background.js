function toggleElement() {
    chrome.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        if (tab.favIconUrl && tab.url.includes("skool.com")) {
          chrome.tabs.sendMessage(tab.id, { message: "toggle_element" });
        }
      }
    });
  }
  
// Toggle elements on all open tabs
function toggleElementsOnAllTabs() {
    chrome.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        if (tab.favIconUrl && tab.url.includes("skool.com")) {
          chrome.tabs.sendMessage(tab.id, { message: "toggle_element" });
        }
      }
    });
  }
  
  // Add listener for browser action click
  chrome.action.onClicked.addListener(function (tab) {
    toggleElementsOnAllTabs();
  });
  
  // Add a listener for the message from the content script to toggle elements.
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
  
  // Add a listener for tab update
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.favIconUrl && tab.url.includes("skool.com")) {
        chrome.tabs.sendMessage(tab.id, { message: "tab_update" });
    }
  });