# Skool Focus Extension

A modern, cross-browser extension that helps you focus while you use the skool.com website. Built with [WXT](https://wxt.dev/) for maximum compatibility and developer experience.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)

## ✨ What's New in v3.0

**🚀 Complete Modernization**
- Migrated to [WXT](https://wxt.dev/) framework for cross-browser support
- **Now supports Chrome, Firefox, and Safari** from a single codebase
- Rewritten in TypeScript for better code quality and maintainability
- Lightning-fast builds with Vite

**🎨 Redesigned UI/UX**
- Modern, card-based interface
- Improved visual hierarchy and spacing
- Smooth animations and transitions
- Better icons using Heroicons
- Enhanced dark mode with refined color palette
- More intuitive toggle switches
- Improved accessibility

## 📦 Installation

### Chrome Web Store
https://chrome.google.com/webstore/detail/skool-focus/nchfffdkbhafombnfcpladflclakmdmo

### Firefox Add-ons
https://addons.mozilla.org/en-US/firefox/addon/skool-focus/

### Safari Extension
*Coming soon*

## 🎯 Features

**Focus Mode**
- One-click toggle to enable all focus features at once
- Shows motivational message to get back to work

**Individual Settings**
- 🔔 Hide Notifications - Remove notification badges
- 📑 Hide Tabs - Remove distracting navigation tabs
- 👥 Hide Community Feed - Remove the community sidebar
- 👤 Hide Profile Buttons - Remove chat and profile buttons

**Additional Features**
- 🌓 Dark/Light mode toggle
- 💾 Settings sync across devices
- ⚡ Fast and lightweight
- 🔒 Privacy-focused (no data collection)

## 🛠️ Development

### Prerequisites
- Node.js 18+ and npm

### Setup

```bash
# Install dependencies
npm install

# Start development server for Chrome
npm run dev

# Start development for Firefox
npm run dev:firefox

# Start development for Safari
npm run dev:safari
```

### Building

```bash
# Build for all browsers
npm run build:all

# Build for specific browser
npm run build:chrome
npm run build:firefox
npm run build:safari

# Create distribution zips
npm run zip:all
```

### Project Structure

```
skool-focus-extension/
├── entrypoints/
│   ├── background.ts        # Background service worker
│   ├── content.ts            # Content script for skool.com
│   └── popup/
│       ├── index.html        # Popup UI
│       ├── main.ts           # Popup logic
│       └── style.css         # Modern styling
├── public/
│   └── images/               # Extension icons
├── wxt.config.ts             # WXT configuration
└── package.json
```

The extension is built using:
- **WXT** - Next-gen web extension framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Vanilla JS** - No heavy frameworks for minimal bundle size

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## ☕ Support Development

If you find this extension helpful, consider supporting its development:

<a href="https://www.buymeacoffee.com/fx64b" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📝 License

GPL-3.0 - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [WXT](https://wxt.dev/) by [aklinker1](https://github.com/aklinker1)
- Icons from [Heroicons](https://heroicons.com/)
- Previous versions used [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
