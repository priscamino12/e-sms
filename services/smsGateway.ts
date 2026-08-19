import { PermissionsAndroid, Platform } from 'react-native';

import SmsReaderNative, { SmsReaderMessage } from '@/modules/sms-reader';

import { insertMessages } from './messages';
import { setWatchedNumber as persistWatchedNumber } from './settings';

// SMS reception is an Android OS capability — there is no equivalent API on iOS/web.
export const isSmsSupported = Platform.OS === 'android';

const SMS_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
  PermissionsAndroid.PERMISSIONS.READ_SMS,
] as const;

export async function hasSmsPermissions(): Promise<boolean> {
  if (!isSmsSupported) return false;
  const results = await Promise.all(SMS_PERMISSIONS.map((permission) => PermissionsAndroid.check(permission)));
  return results.every(Boolean);
}

export type SmsPermissionStatus = 'granted' | 'denied' | 'blocked';

export async function requestSmsPermissions(): Promise<SmsPermissionStatus> {
  if (!isSmsSupported) return 'blocked';
  const results = await PermissionsAndroid.requestMultiple([...SMS_PERMISSIONS]);
  const values = SMS_PERMISSIONS.map((permission) => results[permission]);
  if (values.every((value) => value === PermissionsAndroid.RESULTS.GRANTED)) return 'granted';
  if (values.some((value) => value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) return 'blocked';
  return 'denied';
}

export async function setWatchedNumber(number: string): Promise<void> {
  if (isSmsSupported) {
    SmsReaderNative.setWatchedNumber(number);
  }
  await persistWatchedNumber(number);
}

// Pulls messages the native BroadcastReceiver queued while no JS listener was live (app
// backgrounded or killed) into the durable SQLite store. Safe to call on every app resume.
export async function syncPendingMessages(): Promise<void> {
  if (!isSmsSupported) return;
  const pending = SmsReaderNative.drainPendingMessages();
  if (pending.length > 0) {
    await insertMessages(pending);
  }
}

// Live updates while the app is in the foreground. The native side also always queues the
// same message (same id), so persisting it here too is a harmless no-op via INSERT OR IGNORE
// once syncPendingMessages next runs.
export function subscribeToIncomingMessages(onMessage: (message: SmsReaderMessage) => void) {
  if (!isSmsSupported) {
    return { remove() {} };
  }
  return SmsReaderNative.addListener('onMessageReceived', (message) => {
    insertMessages([message]).catch(() => {});
    onMessage(message);
  });
}
