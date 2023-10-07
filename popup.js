document.addEventListener('DOMContentLoaded', function () {
    const toggleButtons = {
      toggleAll: 'all',
      toggleNotifications: 'notifications',
      toggleCommunityFeed: 'communityFeed'
      
    };
  
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
              chrome.tabs.sendMessage(tab.id, { message: 'tab_update' });
            });
          });
        });
      });
    });
  });
  