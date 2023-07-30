const allXpaths = [
  "//*[@id='__next']/div/div/div[1]/div/div[1]/div[3]/div/div[2]/span/span", // notification badge
  "//*[@id='__next']/div/div/div[1]/div/div[1]/div[3]/div/div[1]/span/span", // message badge
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]", // posts on community feed (also hides video in classroom section, unwanted)
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]", // "write something", tags and "previous - next" (also hides video in classroom section, unwanted) 
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[3]", // "previous - next" navigation
  "//*[@id='__next']/div/div/div[3]/div/div[3]/div", // community sidebar + 30 day leaderboard
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[1]", // community tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[3]", // calendar tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[4]", // members tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[5]", // leaderboard tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[6]", // about tab link
];



// -----------------------------
// different blocking categories
// -----------------------------

// hides notification badges
const notifications= [
  "//*[@id='__next']/div/div/div[1]/div/div[1]/div[3]/div/div[1]/span/span", // notification badge
  "//*[@id='__next']/div/div/div[1]/div/div[1]/div[3]/div/div[2]/span/span", // message badge
];

// hides the tab links to the different categories, except from the classroom tab
const tabLinks = [
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[1]", // community tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[3]", // calendar tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[4]", // members tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[5]", // leaderboard tab link
  "//*[@id='__next']/div/div/div[1]/div/div[2]/a[6]", // about tab link
]

// hides the posts on the community feed
const communityFeed = [
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]", // all posts on the community feed
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[3]", // "previous - next" navigation
  "//*[@id='__next']/div/div/div[3]/div/div[3]/div", // community sidebar + 30 day leaderboard
]

const communityFeedHeader = [
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[1]", // "write something"
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[2]", // upcoming events
  "//*[@id='__next']/div/div/div[3]/div/div[1]/div/div/div[1]/div[1]/div/div[3]", // categories
]


// which element should be hidden
const elementsToHide = notifications;


function toggleElements(xpathExpressions, shouldHide) {
  xpathExpressions.forEach(xpathExpression => {
    const xpathResult = document.evaluate(xpathExpression, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    let element = xpathResult.iterateNext();

    while (element) {
      element.style.display = shouldHide ? "none" : ""; 
      element = xpathResult.iterateNext();
    }
  });
}

// listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === "toggle_element") {
    toggleAndSyncElements();
  } else if (message.message === "tab_update") {
    chrome.storage.sync.get("hideElements", function (data) {
      toggleElements(elementsToHide, data.hideElements);
    });
  }
});

// Function to toggle elements and sync the state using chrome.storage.sync.
function toggleAndSyncElements() {
  chrome.storage.sync.get("hideElements", function (data) {
    const shouldHide = !data.hideElements;
    chrome.storage.sync.set({ hideElements: shouldHide });
    toggleElements(elementsToHide, shouldHide);

    // Send a message to other tabs to update their state
    chrome.runtime.sendMessage({ hideElements: shouldHide });
  });
}

// Retrieve state from chrome.storage.sync and toggle
chrome.storage.sync.get("hideElements", function (data) {
  toggleElements(elementsToHide, data.hideElements);
});