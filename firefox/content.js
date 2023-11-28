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
  '//*[@id="__next"]/div/div/div[2]/div/div/div[3]/div/div[2]/span/span', // notification badge when scrolling down (skool creates a different header when scrolling down for some reason)
  '//*[@id="__next"]/div/div/div[2]/div/div/div[3]/div/div[1]/span/span', // message badge when scrolling down (skool creates a different header when scrolling down for some reason)
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/button', // "Load ? new posts" button
  '//*[@id="__next"]/div/div/div[3]/div/div/div[2]/div/div/div[1]/div[2]/div', // completion icon
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div', // All three icons
  '//*[@id="__next"]/div/div/div[2]/div/div/div[3]/div', // All three icons (header scrolled)
];

// -----------------------------
// different blocking categories
// -----------------------------

const notifications = [
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div/div[1]/span/span', // notification badge
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div/div[2]/span/span', // message badge
  '//*[@id="__next"]/div/div/div[2]/div/div/div[3]/div/div[2]/span/span', // notification badge when scrolling down (skool creates a different header when scrolling down for some reason)
  '//*[@id="__next"]/div/div/div[2]/div/div/div[3]/div/div[1]/span/span' // message badge when scrolling down (skool creates a different header when scrolling down for some reason)
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
  '//*[@id="__next"]/div/div/div[3]/div/div[1]/div/div/div[1]/button', // "Load ? new posts" button
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
  '//*[@id="__next"]/div/div/div[3]/div/div/div[2]/div/div/div[1]/div[2]/div' // completion icon
];

const chatNotificationProfile = [
  '//*[@id="__next"]/div/div/div[1]/div/div[1]/div[3]/div', // All three icons (header top)
  '//*[@id="__next"]/div/div/div[2]/div/div/div[3]/div', // All three icons (header scrolled)
];

let elementsToHide = allXpaths;
let hasScrolled = false;

function handleScroll() {
  if (!hasScrolled) {
    hasScrolled = true;
    // The header has a 300ms transition
    setTimeout(updateElementsToHide, 250)
  }

  // In case the user scroll down and then up again without changing settings
  if(document.documentElement.scrollTop === 0) {
    hasScrolled = false;
  }
}

// fixes issue with hidden classroom content elements
function fixClassroomSection() {
  if (window.location.href.includes("/classroom")) {
    toggleElements(classroomSection, false);
    toggleFocusText(false);
  }
}

function toggleFocusText(display) {
  if(!display) {
    if(document.getElementById("focus-text")){
      document.getElementById("focus-text").remove();
    }
  } else {
    let text = document.createElement("p");
    text.setAttribute("id", "focus-text");
    text.innerHTML = "Get Back to Work <b>RN</b>!";
    text.style.position = "fixed";
    text.style.top = "50%";
    text.style.left = "50%";
    text.style.transform = "translate(-50%, -50%)";
    text.style.fontSize = "50px";
    document.body.appendChild(text);
  }
}

function toggleElements(xpathExpressions, shouldHide) {
  xpathExpressions.forEach((xpathExpression, i) => {
    const xpathResult = document.evaluate(
      xpathExpression,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );

    let element = xpathResult.snapshotItem(i);
  
    for (let i=0 ; i < xpathResult.snapshotLength; i++) {
      xpathResult.snapshotItem(i).style.opacity = shouldHide ? "0" : "1";
      // prevents elements form being clickable because opacity only makes them invisible but not unclickable
      xpathResult.snapshotItem(i).disabled = shouldHide;
      xpathResult.snapshotItem(i).style.pointerEvents = shouldHide ? "none" : "auto";
    }
  });
}

function updateElementsToHide() {
  elementsToHide = [];
  browser.storage.sync.get().then((result)=> {
    if (result.hideElements.all) {
      elementsToHide.push(...allXpaths);
      toggleFocusText(true);
    } else {
      toggleFocusText(false);
      if (result.hideElements.notifications) {
        elementsToHide.push(...notifications);
      }
      if (result.hideElements.tabLinks) {
        elementsToHide.push(...tabLinks);
      }
      if (result.hideElements.communityFeed) {
        elementsToHide.push(...communityFeed);
      }
      if (result.hideElements.communityFeedHeader) {
        elementsToHide.push(...communityFeedHeader);
      }
      if (result.hideElements.chatNotificationProfile) {
        elementsToHide.push(...chatNotificationProfile);
      }
    }
    toggleElements(allXpaths, false); // Display all elements before hiding
    toggleElements(elementsToHide, true);
    fixClassroomSection();
  });
}

// listen for messages from the background script
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  toggleFocusText(false);
  if (message.message === "toggle_element") {
    toggleAndSyncElements();
  } else if (message.message === "tab_update") {
    browser.storage.sync.get("hideElements").then(updateElementsToHide); // because no parameter is used, we should consider another solution
  }
});

// Function to toggle elements and sync the state
function toggleAndSyncElements() {
  updateElementsToHide();
  // Send a message to other tabs to update their state
  browser.runtime.sendMessage({ hideElements: true });
}

// Retrieve state from storage
// Because we don't need data, another solution should be used to call the function
browser.storage.sync.get("hideElements").then(toggleAndSyncElements);

// Check if the user scrolls the site
// This is needed because the site creates a different header when scrolling down
// To prevent the Icon in the second header from showing we need to hide it again
window.addEventListener('scroll', handleScroll);