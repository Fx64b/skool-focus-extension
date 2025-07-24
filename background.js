// Update icon based on current tab
function updateIcon(tab) {
  const isSkoolSite = tab.url && tab.url.includes("skool.com");
  const iconPath = isSkoolSite ? {
    "16": "images/icon-16.png",
    "32": "images/icon-32.png", 
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  } : {
    "16": "images/grayscale/icon-16.png",
    "32": "images/grayscale/icon-32.png",
    "48": "images/grayscale/icon-48.png", 
    "128": "images/grayscale/icon-128.png"
  };
  
  browser.action.setIcon({ path: iconPath });
}

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
  updateIcon(tab);
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
  if (changeInfo.status === 'complete') {
    updateIcon(tab);
  }
  if (tab.favIconUrl && tab.url.includes("skool.com")) {
    browser.tabs.sendMessage(tab.id, { message: "tab_update" });
  }
});

// Listen for tab activation (switching between tabs)
browser.tabs.onActivated.addListener(function (activeInfo) {
  browser.tabs.get(activeInfo.tabId, function (tab) {
    updateIcon(tab);
  });
});

// Initialize icon on startup
browser.runtime.onStartup.addListener(function () {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      updateIcon(tabs[0]);
    }
  });
});

// Initialize icon when extension is installed
browser.runtime.onInstalled.addListener(function () {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      updateIcon(tabs[0]);
    }
  });
});
