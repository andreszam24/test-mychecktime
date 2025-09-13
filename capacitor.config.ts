import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.com.mychecktime.app',
  appName: 'MyCheckTime – Smart Checklists',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    '@capacitor-mlkit/barcode-scanning': {
      formats: ["QR_CODE", "PDF_417"],
      orientationLocked: true,
      // Configuración específica para iOS
      ios: {
        // Usar el escáner nativo de iOS en lugar del módulo de Google
        useNativeScanner: true,
        // Configuración de permisos
        cameraPermission: 'Necesitamos acceso a la cámara para escanear códigos QR y códigos de barras.',
        // Configuración de la interfaz de usuario
        showInstructions: true,
        // Configuración de detección
        detectionTimeout: 30000, // 30 segundos
        // Configuración de orientación
        orientationLocked: true
      },
      // Configuración para Android
      android: {
        // Usar el módulo de Google Barcode Scanner para Android
        useGoogleBarcodeScanner: true,
        // Configuración de permisos
        cameraPermission: 'Necesitamos acceso a la cámara para escanear códigos QR y códigos de barras.',
        // Configuración de la interfaz de usuario
        showInstructions: true,
        // Configuración de detección
        detectionTimeout: 30000, // 30 segundos
        // Configuración de orientación
        orientationLocked: true
      }
    }
  },
  server: {
    allowNavigation: ["mychecktime.com.co"],
    cleartext: true
  }
};

export default config;
