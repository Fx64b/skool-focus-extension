import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Skool Focus',
    version: '3.0.0',
    description: 'A browser extension that helps you focus while you use the skool.com website.',
    permissions: ['activeTab', 'storage'],
    // Needed so `browser.tabs.query` returns tab URLs. Content script match
    // patterns do not grant host permissions under Manifest V3.
    host_permissions: ['*://*.skool.com/*'],
    icons: {
      16: 'images/icon-16.png',
      32: 'images/icon-32.png',
      48: 'images/icon-48.png',
      128: 'images/icon-128.png',
    },
  },
});
