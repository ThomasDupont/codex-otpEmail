import { OTP_MAX_FAILED_ATTEMPTS } from '../configuration.js'
import {
  FAILED_ATTEMPTS_MUST_BE_NON_NEGATIVE,
  MAX_ATTEMPTS_REACHED,
} from '../errors.js'

export class EmailOTPRequestValidationPolicy {
  assertCanValidate(failedAttempts: number): void {
    if (failedAttempts < 0) {
      throw new Error(FAILED_ATTEMPTS_MUST_BE_NON_NEGATIVE)
    }
    if (failedAttempts >= OTP_MAX_FAILED_ATTEMPTS) {
      throw new Error(MAX_ATTEMPTS_REACHED)
    }
  }
}
