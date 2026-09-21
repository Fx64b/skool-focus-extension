/**
 * Background script.
 *
 * The content script now reads `browser.storage.onChanged` directly, so the
 * background script no longer has to broadcast to every tab. That old broadcast
 * could never work anyway: it filtered tabs on `tab.url` and `tab.favIconUrl`,
 * and both are `undefined` unless the extension holds the `tabs` permission or
 * a host permission for that tab.
 */

const DEFAULT_HIDE_ELEMENTS = {
  all: false,
  notifications: false,
  tabLinks: false,
  communityFeed: false,
  chatNotificationProfile: false,
  switchCommunity: false,
};

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    void browser.storage.sync.get('hideElements').then((result) => {
      browser.storage.sync.set({
        hideElements: { ...DEFAULT_HIDE_ELEMENTS, ...(result.hideElements ?? {}) },
      });
    });
  });
});
