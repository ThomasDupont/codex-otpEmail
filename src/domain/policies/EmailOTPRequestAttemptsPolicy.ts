const MAX_FAILED_ATTEMPTS = 10
const LOCK_DELAY_MS = 60 * 1000

export class EmailOTPRequestAttemptsPolicy {
  getDelayMs(failedAttempts: number): number {
    if (failedAttempts < 0) {
      throw new Error('Failed attempts must be non-negative')
    }
    if (failedAttempts <= MAX_FAILED_ATTEMPTS) {
      return 0
    }
    return LOCK_DELAY_MS
  }

  assertCanRequest(failedAttempts: number, lastRequestedAt: Date, now: Date): void {
    const requiredDelayMs = this.getDelayMs(failedAttempts)
    if (requiredDelayMs === 0) {
      return
    }
    const nextAllowedAt = lastRequestedAt.getTime() + requiredDelayMs
    if (now.getTime() < nextAllowedAt) {
      throw new Error('Hors delai pour la demande')
    }
  }
}
