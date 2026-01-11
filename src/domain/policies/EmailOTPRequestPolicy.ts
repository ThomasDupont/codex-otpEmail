import {
  OTP_REQUEST_OUT_OF_DELAY,
  REQUEST_COUNT_MUST_BE_NON_NEGATIVE,
} from '../errors.js'

const INITIAL_DELAY_MS = 120 * 1000
const LONG_DELAY_MS = 60 * 60 * 1000
const MAX_SHORT_DELAY_REQUESTS = 2

export class EmailOTPRequestPolicy {
  getNextDelayMs(previousRequestCount: number): number {
    if (previousRequestCount < 0) {
      throw new Error(REQUEST_COUNT_MUST_BE_NON_NEGATIVE)
    }
    if (previousRequestCount === 0) {
      return 0
    }
    if (previousRequestCount <= MAX_SHORT_DELAY_REQUESTS) {
      return INITIAL_DELAY_MS
    }
    return LONG_DELAY_MS
  }

  assertCanRequest(previousRequestCount: number, lastRequestedAt: Date, now: Date): void {
    const requiredDelayMs = this.getNextDelayMs(previousRequestCount)
    if (requiredDelayMs === 0) {
      return
    }
    const nextAllowedAt = lastRequestedAt.getTime() + requiredDelayMs
    if (now.getTime() < nextAllowedAt) {
      throw new Error(OTP_REQUEST_OUT_OF_DELAY)
  }
}
}
