let navigationLockUntil = 0;

export function tryAcquireNavigationLock(lockDurationMs = 500): boolean {
  const now = Date.now();

  if (now < navigationLockUntil) {
    return false;
  }

  navigationLockUntil = now + lockDurationMs;
  return true;
}
