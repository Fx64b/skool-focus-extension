import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Skool Focus',
    version: '3.0.0',
    description: 'A browser extension that helps you focus while you use the skool.com website.',
    permissions: ['activeTab', 'storage'],
    icons: {
      16: 'images/icon-16.png',
      32: 'images/icon-32.png',
      48: 'images/icon-48.png',
      128: 'images/icon-128.png',
    },
  },
});
