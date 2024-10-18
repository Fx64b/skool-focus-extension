// List of CSS selectors for the elements to hide
const elementsSelectors = {
  notifications: '[class*="styled__UnreadNotificationBubble-"]',
  chatNotificationProfile: '[class*="styled__NavButtonWrapper-"]',
  switchCommunity: '[class*="styled__SwitcherContent-"]',
  tabLinks:
    '[class*="styled__HeaderLinks-"] [class*="styled__ChildrenLink-"]:not(a[href*="/classroom"])',
  communityFeed:
    '[class*="styled__ContentWrapper-"] [class*="styled__AsideLayoutWrapper-"]',
};

let elementsToHide = [];

function toggleElements(selectors, shouldHide) {
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.style.opacity = shouldHide ? "0" : "1";
      element.style.pointerEvents = shouldHide ? "none" : "auto";
    });
  });
}

function updateElementsToHide() {
  elementsToHide = [];
  browser.storage.sync.get().then((result) => {
    if (result.hideElements.all) {
      elementsToHide = Object.values(elementsSelectors);
      toggleFocusText(true);
    } else {
      toggleFocusText(false);
      if (result.hideElements.notifications) {
        elementsToHide.push(elementsSelectors.notifications);
      }
      if (result.hideElements.tabLinks) {
        elementsToHide.push(elementsSelectors.tabLinks);
      }
      if (result.hideElements.communityFeed) {
        elementsToHide.push(elementsSelectors.communityFeed);
      }
      if (result.hideElements.chatNotificationProfile) {
        elementsToHide.push(elementsSelectors.chatNotificationProfile);
      }
    }
    toggleElements(Object.values(elementsSelectors), false); // Display all elements before hiding
    toggleElements(elementsToHide, true);
  });
}

// Function to display or remove the focus text
function toggleFocusText(display) {
  const focusTextId = "focus-text";
  const existingText = document.getElementById(focusTextId);

  if (!display && existingText) {
    existingText.remove();
  } else if (
    display &&
    !existingText &&
    !window.location.href.includes("/classroom")
  ) {
    let text = document.createElement("p");
    text.setAttribute("id", focusTextId);
    text.innerHTML = "Get Back to Work <b>Right Now</b>!";
    text.style.position = "fixed";
    text.style.top = "50%";
    text.style.left = "50%";
    text.style.transform = "translate(-50%, -50%)";
    text.style.fontSize = "50px";
    document.body.appendChild(text);
  }
}

function toggleAndSyncElements() {
  updateElementsToHide();
  browser.runtime.sendMessage({ hideElements: true });
}

browser.runtime.onMessage.addListener((message) => {
  if (message.message === "toggle_element") {
    toggleAndSyncElements();
    console.log("toggled");
  } else if (message.message === "tab_update") {
    browser.storage.sync.get("hideElements").then(updateElementsToHide);
    console.log("tabupdate");
  }
  toggleFocusText(false);
  browser.storage.sync.get("hideElements").then(toggleAndSyncElements);
});

// Apply focus settings as soon as the DOM is fully loaded
window.addEventListener("loadstart", function () {
  // Retrieve state from storage on initial load
  console.log("dom content loaded");
  browser.storage.sync.get("hideElements").then(toggleAndSyncElements);
});

setTimeout(() => {
  browser.storage.sync.get("hideElements").then(toggleAndSyncElements);
}, 3500);
