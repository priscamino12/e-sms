import { SmsReaderMessage } from './SmsReader.types';

/**
 * SMS reception is an Android-only OS capability (see this module's AndroidManifest.xml). This
 * stub only exists so the app doesn't fail to bundle when Metro resolves a web target.
 */
class SmsReaderWebModule {
  setWatchedNumber(_number: string): void {
    // no-op on web
  }

  getWatchedNumber(): string | null {
    return null;
  }

  drainPendingMessages(): SmsReaderMessage[] {
    return [];
  }

  addListener(_eventName: 'onMessageReceived', _listener: (message: SmsReaderMessage) => void) {
    return { remove() {} };
  }

  removeAllListeners(_eventName: 'onMessageReceived'): void {
    // no-op on web
  }
}

export default new SmsReaderWebModule();
