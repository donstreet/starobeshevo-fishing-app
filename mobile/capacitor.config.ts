import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.klevoemesto.app',
  appName: 'Клёвое место',
  webDir: 'www',
  server: {
    url: 'https://klevoe.eko7.ru',
    cleartext: false,
    allowNavigation: [
      'klevoe.eko7.ru'
    ]
  }
};

export default config;
