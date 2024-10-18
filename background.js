// Toggle elements on all open tabs
function toggleElementsOnAllTabs() {
  browser.tabs.query({}, function (tabs) {
    for (const tab of tabs) {
      if (tab.favIconUrl && tab.url.includes("skool.com")) {
        browser.tabs.sendMessage(tab.id, { message: "toggle_element" });
      }
    }
  });
}

browser.action.onClicked.addListener(function (tab) {
  toggleElementsOnAllTabs();
});

// Add a listener for the message from the content script to toggle elements.
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === "toggle_element") {
    // Send a message to all open tabs to toggle elements
    browser.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, {
          hideElements: message.hideElements,
        });
      }
    });
  }
});

// Add a listener for tab update
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.favIconUrl && tab.url.includes("skool.com")) {
    browser.tabs.sendMessage(tab.id, { message: "tab_update" });
  }
});
