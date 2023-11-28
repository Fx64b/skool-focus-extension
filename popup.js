document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = {
    toggleAll: "all",
    toggleNotifications: "notifications",
    toggleTabLinks: "tabLinks",
    toggleCommunityFeed: "communityFeed",
    toggleFeedTop: "communityFeedHeader",
    toggleChatNotificationProfile: "chatNotificationProfile",
  };

  // Function to update the UI state of toggle buttons
  function updateToggleButtonState() {
    chrome.storage.sync.get("hideElements", function (data) {
      const currentHiddenStatus = data.hideElements || {};

      Object.keys(toggleButtons).forEach((buttonId) => {
        const section = toggleButtons[buttonId];
        const button = document.getElementById(buttonId);

        // Update the UI state based on stored value
        button.checked = currentHiddenStatus[section];
      });
    });
  }

  function disableIfNotOnSkool() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (!currentTab.url.includes("skool.com")) {
        Object.keys(toggleButtons).forEach((buttonId) => {
          const button = document.getElementById(buttonId);
          button.disabled = true;
        });
        const overlay = document.getElementById("overlay");
        overlay.style.display = "block";
      }
    });
  }

  updateToggleButtonState();
  disableIfNotOnSkool();

  Object.keys(toggleButtons).forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    button.addEventListener("click", function () {
      const section = toggleButtons[buttonId];
      chrome.storage.sync.get("hideElements", function (data) {
        const currentHiddenStatus = data.hideElements || {};
        currentHiddenStatus[section] = !currentHiddenStatus[section];
        chrome.storage.sync.set({ hideElements: currentHiddenStatus });

        // Send a message to content scripts to update their state
        chrome.tabs.query({}, function (tabs) {
          tabs.forEach((tab) => {
            if (tab.favIconUrl && tab.url.includes("skool.com")) {
              chrome.tabs.sendMessage(tab.id, { message: "tab_update" });
            }
          });
        });
      });
    });
  });

  document.getElementById('skoolLink').addEventListener('click', function () {
    chrome.tabs.create({ url: 'https://www.skool.com' });
  });

  document.getElementById('githubLink').addEventListener('click', function () {
    chrome.tabs.create({ url: 'https://github.com/Fx64b/skool-focus-extension' });
  });

  document.getElementById('bmcLink').addEventListener('click', function () {
    chrome.tabs.create({ url: 'https://www.buymeacoffee.com/fx64b' });
  });
});
