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
npm install
```

### Development (Hot Reload)
```bash
npm run dev              # Chrome (default)
npm run dev:firefox      # Firefox
npm run dev:safari       # Safari
```

### Building
```bash
npm run build:all        # Build for all browsers
npm run build:chrome     # Chrome only
npm run build:firefox    # Firefox only
npm run build:safari     # Safari only
```

### Distribution
```bash
npm run zip:all          # Create zip files for all browsers
npm run zip:chrome       # Chrome zip only
npm run zip:firefox      # Firefox zip only
npm run zip:safari       # Safari zip only
```

**Build outputs** are located in `.output/`:
- Chrome: `.output/chrome-mv3/` (Manifest V3)
- Firefox: `.output/firefox-mv2/` (Manifest V2)
- Safari: `.output/safari-mv2/` (Manifest V2)

## Architecture

### Extension Entry Points

The extension has three main entry points defined in `entrypoints/`:

1. **`background.ts`** - Background service worker
   - Handles browser action clicks
   - Coordinates messaging between popup and content scripts
   - Triggers element toggling across all open skool.com tabs
   - Listens for tab updates to re-apply settings

2. **`content.ts`** - Content script (runs on skool.com pages)
   - Defines CSS selectors for elements to hide (notifications, tabs, community feed, profile buttons)
   - Reads hide settings from `browser.storage.sync`
   - Toggles element visibility using opacity and pointer-events CSS
   - Shows "Get Back to Work Right Now!" focus text when focus mode is enabled
   - Re-applies settings on page load and when receiving messages from background/popup

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
    chatNotificationProfile: boolean
  },
  theme: 'light' | 'dark'
}
```

**Message Flow:**
1. User toggles setting in popup → saves to `browser.storage.sync`
2. Popup sends `{ message: 'tab_update' }` to all skool.com tabs
3. Content script receives message → reads storage → updates DOM

**Element Hiding Strategy:**
- Elements are hidden using CSS `opacity: 0` and `pointer-events: none`
- CSS selectors target dynamically-generated class names (e.g., `[class*="styled__UnreadNotificationBubble-"]`)
- All elements are first shown (opacity: 1), then selectively hidden based on settings
- This approach avoids removing elements from the DOM entirely

### WXT Configuration

`wxt.config.ts` defines:
- Extension manifest (name, version, description)
- Permissions: `activeTab`, `storage`
- Icons in `public/images/`
- `extensionApi: 'chrome'` - Uses Chrome extension API with WXT's polyfill for cross-browser compatibility

### Browser Compatibility

WXT automatically handles cross-browser differences:
- Chrome builds use Manifest V3
- Firefox and Safari use Manifest V2 (as they have better support for it)
- The `browser` global is provided by WXT's polyfill (works in all browsers)

## Key Implementation Details

### CSS Selectors for skool.com

The content script targets skool.com's styled-components class names using attribute selectors:
- `[class*="styled__UnreadNotificationBubble-"]` - Notification badges
- `[class*="styled__NavButtonWrapper-"]` - Chat/profile buttons
- `[class*="styled__SwitcherContent-"]` - Community switcher
- `[class*="styled__HeaderLinks-"] [class*="styled__ChildrenLink-"]:not(a[href*="/classroom"])` - Tab links (except classroom)
- `[class*="styled__ContentWrapper-"] [class*="styled__AsideLayoutWrapper-"]` - Community feed sidebar

**Note:** These selectors are fragile and may break if skool.com changes their CSS-in-JS class naming. When fixing selector issues, use browser DevTools to inspect the current class names.

### Focus Mode Behavior

When "Focus Mode" is enabled (`hideElements.all = true`):
- All individual hide settings are set to `true`
- Individual toggle buttons are disabled in the popup
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
3. Test in dev mode: `npm run dev`

### Modifying the Popup UI

All popup UI is in `entrypoints/popup/`:
- Layout: edit `index.html`
- Styling: edit `style.css` (includes both light and dark theme variables)
- Behavior: edit `main.ts`

### Testing Across Browsers

```bash
# Terminal 1
npm run dev:chrome

# Terminal 2
npm run dev:firefox

# Terminal 3
npm run dev:safari
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
- `activeTab` - To inject content scripts into skool.com tabs
- `storage` - To persist user settings across browser sessions with `browser.storage.sync`
