import {
  FAILED_ATTEMPTS_MUST_BE_NON_NEGATIVE,
  OTP_REQUEST_OUT_OF_DELAY,
} from '../errors.js'

const MAX_FAILED_ATTEMPTS = 10
const LOCK_DELAY_MS = 60 * 60 * 1000

export class EmailOTPRequestAttemptsPolicy {
  getDelayMs(failedAttempts: number): number {
    if (failedAttempts < 0) {
      throw new Error(FAILED_ATTEMPTS_MUST_BE_NON_NEGATIVE)
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
      throw new Error(OTP_REQUEST_OUT_OF_DELAY)
  }
}
}
