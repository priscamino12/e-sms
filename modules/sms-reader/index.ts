// Re-exports the native module. On web, resolves to SmsReaderModule.web.ts (a no-op stub);
// on Android, to SmsReaderModule.ts (the real native binding). SMS reception is Android-only.
export { default } from './src/SmsReaderModule';
export * from './src/SmsReader.types';
