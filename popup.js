document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = {
    toggleAll: "all",
    toggleNotifications: "notifications",
    toggleTabLinks: "tabLinks",
    toggleCommunityFeed: "communityFeed",
    toggleChatNotificationProfile: "chatNotificationProfile",
  };

  const toggleAllButton = document.getElementById("toggleAll");

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

      // Update the state of individual buttons based on focus mode
      if (currentHiddenStatus.all) {
        disableIndividualSettings(true);
      } else {
        disableIndividualSettings(false);
      }
    });
  }

  // Function to disable/enable individual settings buttons
  function disableIndividualSettings(disable) {
    Object.keys(toggleButtons).forEach((buttonId) => {
      if (buttonId !== "toggleAll") {
        const button = document.getElementById(buttonId);
        button.disabled = disable;
      }
    });
  }

  // Function to handle focus mode toggle
  toggleAllButton.addEventListener("click", function () {
    chrome.storage.sync.get("hideElements", function (data) {
      const currentHiddenStatus = data.hideElements || {};
      const isFocusModeEnabled = !currentHiddenStatus.all;

      currentHiddenStatus.all = isFocusModeEnabled;
      Object.keys(toggleButtons).forEach((buttonId) => {
        if (buttonId !== "toggleAll") {
          currentHiddenStatus[toggleButtons[buttonId]] = isFocusModeEnabled;
        }
      });

      chrome.storage.sync.set(
        { hideElements: currentHiddenStatus },
        function () {
          updateToggleButtonState();

          // Send a message to content scripts to update their state
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              if (tab.favIconUrl && tab.url.includes("skool.com")) {
                chrome.tabs.sendMessage(tab.id, { message: "tab_update" });
              }
            });
          });
        },
      );
    });
  });

  // Handle individual setting toggles
  Object.keys(toggleButtons).forEach((buttonId) => {
    if (buttonId !== "toggleAll") {
      const button = document.getElementById(buttonId);
      button.addEventListener("click", function () {
        const section = toggleButtons[buttonId];
        chrome.storage.sync.get("hideElements", function (data) {
          const currentHiddenStatus = data.hideElements || {};
          currentHiddenStatus[section] = !currentHiddenStatus[section];
          chrome.storage.sync.set(
            { hideElements: currentHiddenStatus },
            function () {
              // Send a message to content scripts to update their state
              chrome.tabs.query({}, function (tabs) {
                tabs.forEach((tab) => {
                  if (tab.favIconUrl && tab.url.includes("skool.com")) {
                    chrome.tabs.sendMessage(tab.id, { message: "tab_update" });
                  }
                });
              });
            },
          );
        });
      });
    }
  });

  // Function to disable buttons if not on skool.com
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

  const themeToggle = document.getElementById("theme-toggle");
  const lightModeIcon = document.getElementById("light-mode-icon");
  const darkModeIcon = document.getElementById("dark-mode-icon");

  function toggleIcons() {
    if (document.body.classList.contains("light-mode")) {
      lightModeIcon.classList.add("visible");
      darkModeIcon.classList.remove("visible");
    } else {
      darkModeIcon.classList.add("visible");
      lightModeIcon.classList.remove("visible");
    }
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
    toggleIcons();
  }

  function saveThemePreference(theme) {
    chrome.storage.sync.set({ theme: theme }, function () {
      console.log("Theme preference saved:", theme);
    });
  }

  themeToggle.addEventListener("click", function () {
    if (document.body.classList.contains("light-mode")) {
      applyTheme("dark");
      saveThemePreference("dark");
    } else {
      applyTheme("light");
      saveThemePreference("light");
    }
  });

  chrome.storage.sync.get("theme", function (data) {
    const storedTheme = data.theme || "light";
    applyTheme(storedTheme);
  });

  toggleIcons();

  updateToggleButtonState();
  disableIfNotOnSkool();

  document.getElementById("skoolLink").addEventListener("click", function () {
    chrome.tabs.create({ url: "https://www.skool.com" });
  });

  document.getElementById("githubLink").addEventListener("click", function () {
    chrome.tabs.create({
      url: "https://github.com/Fx64b/skool-focus-extension",
    });
  });

  document.getElementById("bmcLink").addEventListener("click", function () {
    chrome.tabs.create({ url: "https://www.buymeacoffee.com/fx64b" });
  });
});
