chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.message === "toggle_element") {
      sendResponse({ message: "element_toggled" }); 
    }
});