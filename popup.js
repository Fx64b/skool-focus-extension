document.addEventListener('DOMContentLoaded', function () {
    const toggleButtons = {
      toggleAll: 'all',
      toggleNotifications: 'notifications',
      toggleCommunityFeed: 'communityFeed'
    };

    // Function to update the UI state of toggle buttons
    function updateToggleButtonState() {
      chrome.storage.sync.get('hideElements', function (data) {
        const currentHiddenStatus = data.hideElements || {};

        Object.keys(toggleButtons).forEach(buttonId => {
          const section = toggleButtons[buttonId];
          const button = document.getElementById(buttonId);

          // Update the UI state based on stored value
          button.checked = currentHiddenStatus[section];
        });
      });
    }

    updateToggleButtonState();

    Object.keys(toggleButtons).forEach(buttonId => {
      const button = document.getElementById(buttonId);
      button.addEventListener('click', function () {
        const section = toggleButtons[buttonId];
        chrome.storage.sync.get('hideElements', function (data) {
          const currentHiddenStatus = data.hideElements || {};
          currentHiddenStatus[section] = !currentHiddenStatus[section];
          chrome.storage.sync.set({ hideElements: currentHiddenStatus });

          // Send a message to content scripts to update their state
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tab => {
              if (tab.favIconUrl && tab.url.includes('skool.com')) {
                chrome.tabs.sendMessage(tab.id, { message: 'tab_update' });
              }
            });
          });
        });
      });
    });
  });
  