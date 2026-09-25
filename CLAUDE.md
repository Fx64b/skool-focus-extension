# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a cross-browser extension that helps users focus while using skool.com. It's built with [WXT](https://wxt.dev/), a modern web extension framework that enables building for Chrome, Firefox, and Safari from a single TypeScript codebase.

**Key Technologies:**
- **WXT** - Framework that handles cross-browser compatibility and builds
- **TypeScript** - All source code is typed
- **Vite** - Build tool (abstracted by WXT)
- **Vanilla JS** - No frameworks in the runtime code to keep bundle size minimal

## Development Commands

### Setup
```bash
pnpm install
```

### Development (Hot Reload)
```bash
pnpm run dev              # Chrome (default)
pnpm run dev:firefox      # Firefox
pnpm run dev:safari       # Safari
```

### Building
```bash
pnpm run build:all        # Build for all browsers
pnpm run build:chrome     # Chrome only
pnpm run build:firefox    # Firefox only
pnpm run build:safari     # Safari only
```

### Distribution
```bash
pnpm run zip:all          # Create zip files for all browsers
pnpm run zip:chrome       # Chrome zip only
pnpm run zip:firefox      # Firefox zip only
pnpm run zip:safari       # Safari zip only
```

**Build outputs** are located in `.output/`:
- Chrome: `.output/chrome-mv3/` (Manifest V3)
- Firefox: `.output/firefox-mv2/` (Manifest V2)
- Safari: `.output/safari-mv2/` (Manifest V2)

## Architecture

### Extension Entry Points

The extension has three main entry points defined in `entrypoints/`:

1. **`background.ts`** - Background service worker
   - Seeds default `hideElements` values on install/update
   - Nothing else: the content script observes storage directly, so no
     tab broadcast is needed

2. **`content.ts`** - Content script (runs on skool.com pages, at `document_start`)
   - Defines CSS selectors for elements to hide (notifications, tabs, community feed, profile buttons)
   - Injects one stylesheet whose rules are all guarded by a `data-skool-focus`
     attribute on `<html>`
   - Reads hide settings from `browser.storage.sync` and writes the active
     feature keys into that attribute
   - Subscribes to `browser.storage.onChanged`, so popup changes apply instantly
   - Shows "Get Back to Work Right Now!" focus text when focus mode is enabled
   - Re-checks the focus text on client-side navigation via WXT's
     `wxt:locationchange` event

3. **`popup/`** - Extension popup UI
   - `main.ts`: Popup logic for toggle buttons and theme switching
   - `index.html`: Popup structure
   - `style.css`: Modern card-based styling with dark/light theme support

### Data Flow & State Management

**Storage Structure:**
```typescript
browser.storage.sync: {
  hideElements: {
    all: boolean,                      // Focus mode (enables all)
    notifications: boolean,
    tabLinks: boolean,
    communityFeed: boolean,
    chatNotificationProfile: boolean,
    switchCommunity: boolean           // Focus mode only, no popup toggle
  },
  theme: 'light' | 'dark'
}
```

**Message Flow:**
1. User toggles setting in popup → saves to `browser.storage.sync`
2. Content script's `browser.storage.onChanged` listener fires → updates the
   `data-skool-focus` attribute on `<html>`

There is deliberately **no** `tabs.sendMessage` broadcast. The old one filtered
tabs on `tab.url`/`tab.favIconUrl`, which are `undefined` without the `tabs`
permission or a host permission, so it never reached any tab under MV3.

**Element Hiding Strategy:**
- A single `<style>` element is injected at `document_start`
- Each rule is scoped to `html[data-skool-focus~="<featureKey>"]`, so toggling a
  feature is one attribute write and no DOM walk
- Elements are hidden using `opacity: 0 !important` and
  `pointer-events: none !important`
- CSS selectors target dynamically-generated class names (e.g., `[class*="styled__UnreadNotificationBubble-"]`)
- `!important` in a stylesheet is required: skool is a React SPA that re-renders
  constantly and would wipe inline styles set on its own nodes
- This approach avoids removing elements from the DOM entirely

### WXT Configuration

`wxt.config.ts` defines:
- Extension manifest (name, version, description)
- Permissions: `activeTab`, `storage`
- Icons in `public/images/`
- `host_permissions: ['*://*.skool.com/*']` - required for `tabs.query` to
  return tab URLs; content script `matches` do **not** grant host permissions
  under MV3. WXT folds this into `permissions` for the MV2 builds.

WXT 0.20 has no `extensionApi` option and ships **no** webextension-polyfill:
`browser` is just `globalThis.browser ?? globalThis.chrome`. Two consequences:
- Always use the **promise** form of extension APIs. Firefox's native `browser`
  ignores callbacks, so callback-style code silently does nothing there.
- Do not use MV3-only namespaces such as `browser.action` in shared code; it is
  `undefined` in the MV2 builds and throws on background startup.

### Browser Compatibility

WXT automatically handles cross-browser differences:
- Chrome builds use Manifest V3
- Firefox and Safari use Manifest V2 (as they have better support for it)
- The `browser` global is provided by WXT's polyfill (works in all browsers)

## Key Implementation Details

### CSS Selectors for skool.com

`elementsSelectors` in `entrypoints/content.ts` maps each feature key to a
**list** of candidate selectors. Each one is emitted as its own CSS rule, so a
selector that matches nothing — or that an older browser does not support —
never disables the others. A selector list joined with commas would be dropped
whole by the CSS parser as soon as one part is invalid.

**Skool migrated to styled-components v6.** Class names went from
`styled__ComponentName-hash` to an opaque `sc-<hash>-<index>`; the component
name is gone. Every `[class*="styled__..."]` selector now matches nothing, so
the v5 selectors are kept only as a fallback. The `sc-` component id survives
deploys until its source file is edited; the second class (`qvVOK`, `ksuJUe`)
is the style hash and changes on every CSS edit — never target it.

Prefer selectors that do not depend on a hash at all. The current stable hooks:

| Feature | Stable selector | Class fallback |
| --- | --- | --- |
| `notifications` | none available | `.sc-8bc0da1b-0` (shared Badge) |
| `chatNotificationProfile` | `button[aria-label="Open chats"]`, `button:has(> div > svg[viewBox="0 0 30 40"])` (bell), `button:has(> span > div > span[title] > img)` (avatar) | `.sc-ec7c44aa-9 > *` |
| `switchCommunity` | `button:has(> div > svg[viewBox="0 0 12 20"])` | `.sc-91437f7d-4` |
| `tabLinks` | `div:has(> a[href$="/-/members"]):has(> a[href$="/about"]) > a:not([href*="/classroom"])` | `.sc-ec7c44aa-11 > a:not(...)` |
| `communityFeed` | `form:has(input[placeholder^="Search"])` (header search) | `.sc-4ec28781-13` (feed column, community page only), `.sc-5cd66e93-3` (sidebar), `.sc-ec7c44aa-6` (search slot) |

The `tabLinks` selector uses the fact that the tab bar is the only element with
both a Members and an About link as **direct** children — the sidebar has a
Members link but no About link, so it is not caught.

SVG `viewBox` values work well as hooks: icon geometry rarely changes, and each
one is unique in the header.

**Note:** skool has no `data-testid` on any of these elements, so there is no
fully stable hook for the badges or the sidebar. When they break, open
skool.com with DevTools and inspect the element.

### Focus Mode Behavior

When "Focus Mode" is enabled (`hideElements.all = true`):
- All individual hide settings are set to `true`
- Individual toggle buttons are disabled in the popup
- The community switcher (`switchCommunity`) is hidden too; it has no popup toggle
- A large "Get Back to Work Right Now!" message appears on skool.com pages (except `/classroom` pages)
- The focus text is positioned fixed at center with `translate(-50%, -50%)`

### Theme System

The popup supports light/dark themes:
- Theme preference stored in `browser.storage.sync.theme`
- Default is light mode
- Toggle button in popup footer shows sun/moon icons
- Themes applied via `.light-mode` or `.dark-mode` classes on `<body>`

### Tab Restriction

The popup disables all toggle buttons when not on a skool.com page:
- Checks if current tab URL includes `'skool.com'`
- Shows an overlay with "Please navigate to Skool" message

## CI/CD Workflows

### Build Workflow (`.github/workflows/build.yml`)
- Runs on all pushes and pull requests
- Builds for all browsers in parallel using matrix strategy
- Verifies manifest files exist for each browser
- Uploads build artifacts (7-day retention for branches, 30 days for verified builds)

### Release Workflow (`.github/workflows/release.yml`)
- Triggers on version tags (e.g., `v3.0.0`)
- Builds and zips all browser versions
- Creates GitHub release with all distribution zips

**To create a release:**
```bash
git tag v3.0.0
git push origin v3.0.0
```

## Common Development Tasks

### Adding a New Toggle Setting

1. Add selector to `elementsSelectors` in `entrypoints/content.ts`
2. Add toggle button ID to `toggleButtons` in `entrypoints/popup/main.ts`
3. Add HTML for the toggle in `entrypoints/popup/index.html`
4. The storage, message passing, and UI updates will work automatically

### Updating for skool.com Changes

If skool.com changes their UI and selectors break:
1. Inspect the new elements in DevTools
2. Update selectors in `elementsSelectors` in `entrypoints/content.ts`
3. Test in dev mode: `pnpm run dev`

### Modifying the Popup UI

All popup UI is in `entrypoints/popup/`:
- Layout: edit `index.html`
- Styling: edit `style.css` (includes both light and dark theme variables)
- Behavior: edit `main.ts`

### Testing Across Browsers

```bash
# Terminal 1
pnpm run dev

# Terminal 2
pnpm run dev:firefox

# Terminal 3
pnpm run dev:safari
```

Load the unpacked extension from `.output/chrome-mv3/`, `.output/firefox-mv2/`, or `.output/safari-mv2/` respectively.

## WXT-Specific Patterns

- Entry points use WXT's `defineBackground()`, `defineContentScript()` helpers
- The `browser` global is auto-imported and works across all browsers
- Build outputs are in `.output/` directory (gitignored)
- WXT auto-generates manifest files and handles module bundling
- TypeScript types are in `.wxt/tsconfig.json` (auto-generated)

## Permissions

The extension requires:
- `activeTab` - Lets the popup read the active tab's URL for the "not on skool.com" overlay
- `storage` - To persist user settings across browser sessions with `browser.storage.sync`
- `host_permissions: *://*.skool.com/*` - Lets `tabs.query` return skool tab URLs
