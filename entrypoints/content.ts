/**
 * Content script.
 *
 * Hiding is done with a single injected stylesheet that is keyed off a
 * `data-skool-focus` attribute on <html>. Skool is a React/Next.js single page
 * application: it re-renders its tree on navigation and on almost every
 * interaction, which wipes inline styles set on its nodes. A stylesheet plus an
 * attribute survives all of that, so no MutationObserver or polling is needed.
 */

type FeatureKey =
  | 'notifications'
  | 'tabLinks'
  | 'communityFeed'
  | 'chatNotificationProfile'
  | 'switchCommunity';

/**
 * CSS selectors for the elements to hide, one list per feature.
 *
 * Skool moved from styled-components v5 to v6, which renamed every class from
 * `styled__ComponentName-hash` to an opaque `sc-<hash>-<index>`. The name of
 * the component is gone, so the only stable hooks left in the markup are ARIA
 * labels, hrefs and SVG `viewBox` geometry. Each feature therefore holds
 * several candidate selectors: the stable ones first, the class-name ones last.
 *
 * A selector that matches nothing is harmless, and each one is emitted as its
 * own CSS rule, so one dead or unsupported selector never disables the others.
 *
 * To refresh these, open skool.com with DevTools and inspect the element.
 */
const elementsSelectors: Record<FeatureKey, string[]> = {
  // The unread count bubbles on the chat and notification buttons.
  notifications: [
    // Shared Badge component. Used by both bubbles and nothing else.
    '.sc-8bc0da1b-0',
    // styled-components v5 markup.
    '[class*="styled__UnreadNotificationBubble-"]',
  ],

  // Chat, notification and profile buttons at the top right.
  chatNotificationProfile: [
    // The whole button group, badges included.
    '.sc-ec7c44aa-9 > *',
    // Per-button fallbacks, keyed on ARIA and icon geometry.
    'button[aria-label="Open chats"]',
    'button:has(> div > svg[viewBox="0 0 30 40"])',
    'button:has(> span > div > span[title] > img)',
    '[class*="styled__NavButtonWrapper-"]',
  ],

  // The chevron button that opens the community switcher.
  switchCommunity: [
    'button:has(> div > svg[viewBox="0 0 12 20"])',
    '.sc-91437f7d-4',
    '[class*="styled__SwitcherContent-"]',
  ],

  // Header tabs, except Classroom. The tab bar is the only element that has
  // both a Members and an About link as direct children.
  tabLinks: [
    'div:has(> a[href$="/-/members"]):has(> a[href$="/about"]) > a:not([href*="/classroom"])',
    '.sc-ec7c44aa-11 > a:not([href*="/classroom"])',
    '[class*="styled__HeaderLinks-"] [class*="styled__ChildrenLink-"]:not(a[href*="/classroom"])',
  ],

  // The community feed: posts, the right sidebar and the header search bar.
  communityFeed: [
    // Feed column: composer, category chips and posts. Only rendered on the
    // community page; Members and About share the layout but not this column.
    // An opened post is portaled outside it, so it stays readable.
    '.sc-4ec28781-13',
    // Right sidebar: group card and leaderboard.
    '.sc-5cd66e93-3',
    // Header search bar. Its placeholder is "Search", or "Search members" on
    // the Members page. No other form on skool has one.
    'form:has(input[placeholder^="Search"])',
    '.sc-ec7c44aa-6',
    '[class*="styled__ContentWrapper-"] [class*="styled__AsideLayoutWrapper-"]',
  ],
};

const FEATURE_KEYS = Object.keys(elementsSelectors) as FeatureKey[];

const STYLE_ELEMENT_ID = 'skool-focus-style';
const FOCUS_TEXT_ID = 'skool-focus-text';
const ROOT_ATTRIBUTE = 'data-skool-focus';

export default defineContentScript({
  matches: ['*://*.skool.com/*'],
  runAt: 'document_start',
  main(ctx) {
    let focusModeEnabled = false;

    /**
     * Builds the stylesheet once. Every rule is guarded by the attribute on
     * <html>, so toggling a feature is a single attribute write.
     *
     * Each candidate selector gets its own rule. A selector list is dropped
     * whole by the CSS parser as soon as one of its parts is invalid or
     * unsupported, which would take the working selectors down with the
     * `:has()` ones on an older browser.
     */
    function buildStyleSheet(): string {
      const rules: string[] = [];

      FEATURE_KEYS.forEach((key) => {
        elementsSelectors[key].forEach((part) => {
          rules.push(
            `html[${ROOT_ATTRIBUTE}~="${key}"] ${part} {\n` +
              '  opacity: 0 !important;\n' +
              '  pointer-events: none !important;\n' +
              '}'
          );
        });
      });

      rules.push(
        `#${FOCUS_TEXT_ID} {\n` +
          '  position: fixed !important;\n' +
          '  top: 50% !important;\n' +
          '  left: 50% !important;\n' +
          '  transform: translate(-50%, -50%) !important;\n' +
          '  z-index: 2147483647 !important;\n' +
          '  margin: 0 !important;\n' +
          '  font-size: 50px !important;\n' +
          '  text-align: center !important;\n' +
          '  pointer-events: none !important;\n' +
          '}'
      );

      return rules.join('\n\n');
    }

    function injectStyleSheet() {
      if (document.getElementById(STYLE_ELEMENT_ID)) {
        return;
      }

      const style = document.createElement('style');
      style.id = STYLE_ELEMENT_ID;
      style.textContent = buildStyleSheet();
      (document.head ?? document.documentElement).appendChild(style);
    }

    /** Writes the set of active features onto <html>. */
    function applyFeatures(active: FeatureKey[]) {
      if (active.length === 0) {
        document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
      } else {
        document.documentElement.setAttribute(ROOT_ATTRIBUTE, active.join(' '));
      }
    }

    /** Adds or removes the focus message. Classroom pages stay untouched. */
    function toggleFocusText(display: boolean) {
      const existingText = document.getElementById(FOCUS_TEXT_ID);
      const onClassroomPage = window.location.pathname.includes('/classroom');

      if (!display || onClassroomPage) {
        existingText?.remove();
        return;
      }

      if (existingText || !document.body) {
        return;
      }

      const text = document.createElement('p');
      text.setAttribute('id', FOCUS_TEXT_ID);
      text.innerHTML = 'Get Back to Work <b>Right Now</b>!';
      document.body.appendChild(text);
    }

    function updateElementsToHide() {
      return browser.storage.sync.get('hideElements').then((result) => {
        const hideElements = (result.hideElements ?? {}) as Record<string, boolean>;
        focusModeEnabled = Boolean(hideElements.all);

        const active = focusModeEnabled
          ? FEATURE_KEYS
          : FEATURE_KEYS.filter((key) => Boolean(hideElements[key]));

        injectStyleSheet();
        applyFeatures(active);
        toggleFocusText(focusModeEnabled);
      });
    }

    // React to changes from the popup. This replaces the old tabs.sendMessage
    // broadcast, which needed tab URLs the extension has no permission to read.
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.hideElements) {
        void updateElementsToHide();
      }
    });

    // The popup and the background script may still ping us directly.
    browser.runtime.onMessage.addListener((message) => {
      if (message?.message === 'tab_update' || message?.message === 'toggle_element') {
        void updateElementsToHide();
      }
    });

    /**
     * Skool navigates client side, so there is no page load to hook into. The
     * stylesheet keeps working on its own; only the focus message has to be
     * re-evaluated, because it is skipped on classroom pages. WXT watches the
     * location for us; patching `history.pushState` would not work, because the
     * content script runs in an isolated world and never sees the page's calls.
     */
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      injectStyleSheet();
      toggleFocusText(focusModeEnabled);
    });

    injectStyleSheet();
    void updateElementsToHide();

    // At document_start the body does not exist yet, so the focus message
    // cannot be appended. Re-run once the document is parsed.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        void updateElementsToHide();
      });
    }
  },
});
