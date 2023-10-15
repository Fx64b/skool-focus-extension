const allXpaths = [
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div/div[2]/span/span', // notification badge
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div/div[1]/span/span', // message badge
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]', // posts on community feed (also hides video in classroom section, unwanted)
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]', // 'write something', tags and 'previous - next' (also hides video in classroom section, unwanted)
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[3]', // 'previous - next' navigation
  '//*[@id="__next"]/div/div/div[3]/div/div[3]/div', // community sidebar + 30 day leaderboard
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[1]', // community tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[3]', // calendar tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[4]', // members tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[5]', // leaderboard tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[6]', // about tab link
  '//*[@id="__next"]/div/div/div[3]/div/div/div[2]/div/div', // something in classroom section
  '//*[@id="__next"]/div/div/div[3]/div/div/div[1]/div/div[1]', // Title and completion status
  '//*[@id="__next"]/div/div/div[3]/div/div/div[2]/div/div/div[2]', // post content
  '//*[@id="__next"]/div/div/div[3]/div/div/div[1]/div/div[1]/div[2]', // completion status
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[1]', // 'write something'
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[2]', // upcoming events
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[3]', // categories
];

// -----------------------------
// different blocking categories
// -----------------------------

const notifications = [
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div/div[1]/span/span', // notification badge
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div/div[2]/span/span', // message badge
];

const tabLinks = [
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[1]', // community tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[3]', // calendar tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[4]', // members tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[5]', // leaderboard tab link
  '//*[@id="__next"]/div/div/div[1]/div/div[2]/a[6]', // about tab link
];

const communityFeed = [
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]', // all posts on the community feed
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[3]', // 'previous - next' navigation
  '//*[@id="__next"]/div/div/div[3]/div/div[3]/div', // community sidebar + 30 day leaderboard
];

const communityFeedHeader = [
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[1]', // 'write something'
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[2]', // upcoming events
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[3]', // categories
];

const classroomSection = [
  '//*[@id="__next"]/div/div/div[3]/div/div/div[2]/div/div',
  '//*[@id="__next"]/div/div/div[3]/div/div/div[1]/div/div[1]', // Title and completion status
  '//*[@id="__next"]/div/div/div[3]/div/div/div[2]/div/div/div[2]', // post content
  '//*[@id="__next"]/div/div/div[3]/div/div/div[1]/div/div[1]/div[2]', // completion status
];

let elementsToHide = allXpaths;

// fixes issue with hidden classroom content elements
function fixClassroomSection() {
  if (window.location.href.includes("/classroom")) {
    toggleElements(classroomSection, false);
  }
}

function toggleElements(xpathExpressions, shouldHide) {
  xpathExpressions.forEach((xpathExpression) => {
    const xpathResult = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null,
    );
    let element = xpathResult.iterateNext();

    while (element) {
      element.style.display = shouldHide ? "none" : "initial";
      element = xpathResult.iterateNext();
    }
  });
}

// TODO: conver ifs to shorthand
function updateElementsToHide() {
  elementsToHide = [];
  chrome.storage.sync.get(function (result) {
    if (result.hideElements.all) {
      elementsToHide.push(...allXpaths);
    } else {
      if (result.hideElements.notifications) {
        elementsToHide.push(...notifications);
      }
      if (result.hideElements.communityFeed) {
        elementsToHide.push(...communityFeed);
      }
    }
    toggleElements(allXpaths, false); // Display all elements before hiding
    toggleElements(elementsToHide, true);
    fixClassroomSection();
  });
}

// listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === "toggle_element") {
    toggleAndSyncElements();
  } else if (message.message === "tab_update") {
    chrome.storage.sync.get("hideElements", function (data) {
      updateElementsToHide();
    });
  }
});

// Function to toggle elements and sync the state using chrome.storage.sync.
function toggleAndSyncElements() {
  updateElementsToHide();
  // Send a message to other tabs to update their state
  chrome.runtime.sendMessage({ hideElements: true });
}

// Retrieve state from chrome.storage.sync and toggle
chrome.storage.sync.get("hideElements", function (data) {
  toggleAndSyncElements();
});
