import {
  OTP_REQUEST_LONG_DELAY_MS,
  OTP_REQUEST_INITIAL_DELAY_MS,
  OTP_REQUEST_MAX_SHORT_DELAY_COUNT,
} from '../configuration.js'
import {
  OTP_REQUEST_OUT_OF_DELAY,
  REQUEST_COUNT_MUST_BE_NON_NEGATIVE,
} from '../errors.js'

export class EmailOTPRequestPolicy {
  getNextDelayMs(previousRequestCount: number): number {
    if (previousRequestCount < 0) {
      throw new Error(REQUEST_COUNT_MUST_BE_NON_NEGATIVE)
    }
    if (previousRequestCount === 0) {
      return 0
    }
    if (previousRequestCount <= OTP_REQUEST_MAX_SHORT_DELAY_COUNT) {
      return OTP_REQUEST_INITIAL_DELAY_MS
    }
    return OTP_REQUEST_LONG_DELAY_MS
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
