function toggleElement() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0 && tabs[0].url.includes("skool.com")) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "toggle_element" }, function (response) {
            console.log(response);
        });
        }
    });
}

chrome.action.onClicked.addListener(function (tab) {
    toggleElement();
});