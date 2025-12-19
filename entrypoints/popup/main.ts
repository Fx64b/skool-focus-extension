import './style.css';

document.addEventListener('DOMContentLoaded', function () {
  const toggleButtons = {
    toggleAll: 'all',
    toggleNotifications: 'notifications',
    toggleTabLinks: 'tabLinks',
    toggleCommunityFeed: 'communityFeed',
    toggleChatNotificationProfile: 'chatNotificationProfile',
  };

  const toggleAllButton = document.getElementById('toggleAll') as HTMLInputElement;

  // Function to update the UI state of toggle buttons
  function updateToggleButtonState() {
    browser.storage.sync.get('hideElements', function (data) {
      const currentHiddenStatus = data.hideElements || {};

      Object.keys(toggleButtons).forEach((buttonId) => {
        const section = toggleButtons[buttonId as keyof typeof toggleButtons];
        const button = document.getElementById(buttonId) as HTMLInputElement;

        if (button) {
          // Update the UI state based on stored value
          button.checked = currentHiddenStatus[section];
        }
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
  function disableIndividualSettings(disable: boolean) {
    Object.keys(toggleButtons).forEach((buttonId) => {
      if (buttonId !== 'toggleAll') {
        const button = document.getElementById(buttonId) as HTMLInputElement;
        if (button) {
          button.disabled = disable;
        }
      }
    });
  }

  // Function to handle focus mode toggle
  if (toggleAllButton) {
    toggleAllButton.addEventListener('click', function () {
      browser.storage.sync.get('hideElements', function (data) {
        const currentHiddenStatus = data.hideElements || {};
        const isFocusModeEnabled = !currentHiddenStatus.all;

        currentHiddenStatus.all = isFocusModeEnabled;
        Object.keys(toggleButtons).forEach((buttonId) => {
          if (buttonId !== 'toggleAll') {
            currentHiddenStatus[toggleButtons[buttonId as keyof typeof toggleButtons]] =
              isFocusModeEnabled;
          }
        });

        browser.storage.sync.set({ hideElements: currentHiddenStatus }, function () {
          updateToggleButtonState();

          // Send a message to content scripts to update their state
          browser.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              if (tab.favIconUrl && tab.url?.includes('skool.com')) {
                browser.tabs.sendMessage(tab.id!, { message: 'tab_update' });
              }
            });
          });
        });
      });
    });
  }

  // Handle individual setting toggles
  Object.keys(toggleButtons).forEach((buttonId) => {
    if (buttonId !== 'toggleAll') {
      const button = document.getElementById(buttonId) as HTMLInputElement;
      if (button) {
        button.addEventListener('click', function () {
          const section = toggleButtons[buttonId as keyof typeof toggleButtons];
          browser.storage.sync.get('hideElements', function (data) {
            const currentHiddenStatus = data.hideElements || {};
            currentHiddenStatus[section] = !currentHiddenStatus[section];
            browser.storage.sync.set({ hideElements: currentHiddenStatus }, function () {
              // Send a message to content scripts to update their state
              browser.tabs.query({}, function (tabs) {
                tabs.forEach((tab) => {
                  if (tab.favIconUrl && tab.url?.includes('skool.com')) {
                    browser.tabs.sendMessage(tab.id!, { message: 'tab_update' });
                  }
                });
              });
            });
          });
        });
      }
    }
  });

  // Function to disable buttons if not on skool.com
  function disableIfNotOnSkool() {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (!currentTab.url?.includes('skool.com')) {
        Object.keys(toggleButtons).forEach((buttonId) => {
          const button = document.getElementById(buttonId) as HTMLInputElement;
          if (button) {
            button.disabled = true;
          }
        });
        const overlay = document.getElementById('overlay');
        if (overlay) {
          overlay.classList.add('visible');
        }
      }
    });
  }

  const themeToggle = document.getElementById('theme-toggle');
  const lightModeIcon = document.getElementById('light-mode-icon');
  const darkModeIcon = document.getElementById('dark-mode-icon');

  function toggleIcons() {
    if (document.body.classList.contains('light-mode')) {
      lightModeIcon?.classList.add('visible');
      darkModeIcon?.classList.remove('visible');
    } else {
      darkModeIcon?.classList.add('visible');
      lightModeIcon?.classList.remove('visible');
    }
  }

  function applyTheme(theme: string) {
    if (theme === 'dark') {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
    toggleIcons();
  }

  function saveThemePreference(theme: string) {
    browser.storage.sync.set({ theme: theme }, function () {
      console.log('Theme preference saved:', theme);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      if (document.body.classList.contains('light-mode')) {
        applyTheme('dark');
        saveThemePreference('dark');
      } else {
        applyTheme('light');
        saveThemePreference('light');
      }
    });
  }

  browser.storage.sync.get('theme', function (data) {
    const storedTheme = data.theme || 'light';
    applyTheme(storedTheme);
  });

  toggleIcons();

  updateToggleButtonState();
  disableIfNotOnSkool();

  document.getElementById('skoolLink')?.addEventListener('click', function () {
    // First, try to find an existing skool.com tab
    browser.tabs.query({}, function (tabs) {
      const skoolTab = tabs.find((tab) => tab.url?.includes('skool.com'));

      if (skoolTab && skoolTab.id) {
        // Switch to the existing skool.com tab
        browser.tabs.update(skoolTab.id, { active: true });
        // Also focus the window containing that tab
        if (skoolTab.windowId) {
          browser.windows.update(skoolTab.windowId, { focused: true });
        }
      } else {
        // No skool.com tab found, create a new one
        browser.tabs.create({ url: 'https://www.skool.com' });
      }
    });
  });

  document.getElementById('githubLink')?.addEventListener('click', function () {
    browser.tabs.create({
      url: 'https://github.com/Fx64b/skool-focus-extension',
    });
  });

  document.getElementById('skoolVideosLink')?.addEventListener('click', function () {
    browser.tabs.create({ url: 'https://skool.fx64b.dev' });
  });

  document.getElementById('bmcLink')?.addEventListener('click', function () {
    browser.tabs.create({ url: 'https://www.buymeacoffee.com/fx64b' });
  });
});
