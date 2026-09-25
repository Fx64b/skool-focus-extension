import './style.css';

/**
 * Popup logic.
 *
 * Every extension API call here is promise based. Chrome supports both styles,
 * but Firefox's `browser` namespace ignores callbacks, so the old callback code
 * silently did nothing there.
 *
 * Settings are written to `browser.storage.sync` only. The content script picks
 * them up through `browser.storage.onChanged`, so the popup does not have to
 * message the tabs.
 */

const SKOOL_URL_PATTERN = '*://*.skool.com/*';

document.addEventListener('DOMContentLoaded', function () {
  const toggleButtons = {
    toggleAll: 'all',
    toggleNotifications: 'notifications',
    toggleTabLinks: 'tabLinks',
    toggleCommunityFeed: 'communityFeed',
    toggleChatNotificationProfile: 'chatNotificationProfile',
  } as const;

  type ButtonId = keyof typeof toggleButtons;

  const buttonIds = Object.keys(toggleButtons) as ButtonId[];

  const toggleAllButton = document.getElementById('toggleAll') as HTMLInputElement | null;

  function getHideElements(): Promise<Record<string, boolean>> {
    return browser.storage.sync
      .get('hideElements')
      .then((data) => (data.hideElements ?? {}) as Record<string, boolean>);
  }

  // Function to update the UI state of toggle buttons
  function updateToggleButtonState() {
    return getHideElements().then((currentHiddenStatus) => {
      buttonIds.forEach((buttonId) => {
        const section = toggleButtons[buttonId];
        const button = document.getElementById(buttonId) as HTMLInputElement | null;

        if (button) {
          // Update the UI state based on stored value
          button.checked = Boolean(currentHiddenStatus[section]);
        }
      });

      // Update the state of individual buttons based on focus mode
      disableIndividualSettings(Boolean(currentHiddenStatus.all));
    });
  }

  // Function to disable/enable individual settings buttons
  function disableIndividualSettings(disable: boolean) {
    buttonIds.forEach((buttonId) => {
      if (buttonId !== 'toggleAll') {
        const button = document.getElementById(buttonId) as HTMLInputElement | null;
        if (button) {
          button.disabled = disable;
        }
      }
    });
  }

  // Function to handle focus mode toggle
  if (toggleAllButton) {
    toggleAllButton.addEventListener('change', function () {
      void getHideElements().then((currentHiddenStatus) => {
        const isFocusModeEnabled = toggleAllButton.checked;

        currentHiddenStatus.all = isFocusModeEnabled;
        buttonIds.forEach((buttonId) => {
          if (buttonId !== 'toggleAll') {
            currentHiddenStatus[toggleButtons[buttonId]] = isFocusModeEnabled;
          }
        });

        return browser.storage.sync
          .set({ hideElements: currentHiddenStatus })
          .then(updateToggleButtonState);
      });
    });
  }

  // Handle individual setting toggles
  buttonIds.forEach((buttonId) => {
    if (buttonId === 'toggleAll') {
      return;
    }

    const button = document.getElementById(buttonId) as HTMLInputElement | null;
    if (!button) {
      return;
    }

    button.addEventListener('change', function () {
      const section = toggleButtons[buttonId];
      void getHideElements().then((currentHiddenStatus) => {
        currentHiddenStatus[section] = button.checked;
        return browser.storage.sync.set({ hideElements: currentHiddenStatus });
      });
    });
  });

  // Function to disable buttons if not on skool.com
  function disableIfNotOnSkool() {
    return browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const currentTab = tabs[0];
        if (currentTab?.url?.includes('skool.com')) {
          return;
        }

        buttonIds.forEach((buttonId) => {
          const button = document.getElementById(buttonId) as HTMLInputElement | null;
          if (button) {
            button.disabled = true;
          }
        });

        document.getElementById('overlay')?.classList.add('visible');
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
    return browser.storage.sync.set({ theme: theme });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
      applyTheme(nextTheme);
      void saveThemePreference(nextTheme);
    });
  }

  void browser.storage.sync.get('theme').then((data) => {
    applyTheme((data.theme as string) || 'light');
  });

  toggleIcons();

  void updateToggleButtonState();
  void disableIfNotOnSkool();

  function openInNewTab(url: string) {
    void browser.tabs.create({ url });
  }

  document.getElementById('skoolLink')?.addEventListener('click', function () {
    // First, try to find an existing skool.com tab
    void browser.tabs.query({ url: SKOOL_URL_PATTERN }).then((tabs) => {
      const skoolTab = tabs[0];

      if (!skoolTab?.id) {
        // No skool.com tab found, create a new one
        openInNewTab('https://www.skool.com');
        return;
      }

      // Switch to the existing skool.com tab
      void browser.tabs.update(skoolTab.id, { active: true });
      // Also focus the window containing that tab
      if (skoolTab.windowId != null) {
        void browser.windows.update(skoolTab.windowId, { focused: true });
      }
    });
  });

  document.getElementById('githubLink')?.addEventListener('click', function () {
    openInNewTab('https://github.com/Fx64b/skool-focus-extension');
  });

  document.getElementById('bmcLink')?.addEventListener('click', function () {
    openInNewTab('https://www.buymeacoffee.com/fx64b');
  });
});
