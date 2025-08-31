import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.com.mychecktime.app',
  appName: 'MyCheckTime',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    '@capacitor-mlkit/barcode-scanning': {
      formats: ["QR_CODE", "PDF_417"],
      orientationLocked: true
    }
  },
  server: {
    allowNavigation: ["mychecktime.com.co"],
    cleartext: true
  }
};

export default config;
