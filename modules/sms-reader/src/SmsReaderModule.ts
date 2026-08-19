import { NativeModule, requireNativeModule } from 'expo';

import { SmsReaderModuleEvents, SmsReaderMessage } from './SmsReader.types';

declare class SmsReaderNativeModule extends NativeModule<SmsReaderModuleEvents> {
  setWatchedNumber(number: string): void;
  getWatchedNumber(): string | null;
  drainPendingMessages(): SmsReaderMessage[];
}

// This call loads the native module object from the JSI. Android only — see SmsReaderModule.web.ts.
export default requireNativeModule<SmsReaderNativeModule>('SmsReader');
