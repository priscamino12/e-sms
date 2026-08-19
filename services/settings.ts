import { getDatabase } from './database';

export type Settings = {
  watchedNumber: string | null;
  numberVerified: boolean;
  onboardingComplete: boolean;
};

const KEYS = {
  watchedNumber: 'watched_number',
  numberVerified: 'number_verified',
  onboardingComplete: 'onboarding_complete',
} as const;

async function getValue(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string | null }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

async function setValue(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

export async function getSettings(): Promise<Settings> {
  const [watchedNumber, numberVerified, onboardingComplete] = await Promise.all([
    getValue(KEYS.watchedNumber),
    getValue(KEYS.numberVerified),
    getValue(KEYS.onboardingComplete),
  ]);
  return {
    watchedNumber,
    numberVerified: numberVerified === '1',
    onboardingComplete: onboardingComplete === '1',
  };
}

export async function setWatchedNumber(number: string): Promise<void> {
  await setValue(KEYS.watchedNumber, number);
}

export async function setNumberVerified(verified: boolean): Promise<void> {
  await setValue(KEYS.numberVerified, verified ? '1' : '0');
}

export async function setOnboardingComplete(complete: boolean): Promise<void> {
  await setValue(KEYS.onboardingComplete, complete ? '1' : '0');
}

export async function resetSettings(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM settings');
}
