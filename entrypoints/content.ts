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
 * Skool uses styled-components, so the class names carry a generated hash
 * suffix and can change with any deploy. Each feature therefore holds several
 * candidate selectors: stable ones first (ARIA roles, hrefs, test ids), the
 * fragile class-name ones last. A selector that matches nothing is harmless, so
 * old and new markup can be supported at the same time.
 *
 * To update these, open skool.com with DevTools and inspect the element.
 */
const elementsSelectors: Record<FeatureKey, string[]> = {
  notifications: ['[class*="styled__UnreadNotificationBubble-"]'],
  chatNotificationProfile: ['[class*="styled__NavButtonWrapper-"]'],
  switchCommunity: ['[class*="styled__SwitcherContent-"]'],
  tabLinks: [
    '[class*="styled__HeaderLinks-"] [class*="styled__ChildrenLink-"]:not(a[href*="/classroom"])',
  ],
  communityFeed: [
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
     */
    function buildStyleSheet(): string {
      const rules = FEATURE_KEYS.map((key) => {
        const selector = elementsSelectors[key]
          .map((part) => `html[${ROOT_ATTRIBUTE}~="${key}"] ${part}`)
          .join(',\n');

        return `${selector} {\n  opacity: 0 !important;\n  pointer-events: none !important;\n}`;
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
