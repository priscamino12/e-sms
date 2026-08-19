// In-memory only (not persisted): the PIN lock is meant to guard cold starts of the app
// process, not every screen transition within a single running session.
let unlocked = false;

export function isUnlocked(): boolean {
  return unlocked;
}

export function markUnlocked(): void {
  unlocked = true;
}
