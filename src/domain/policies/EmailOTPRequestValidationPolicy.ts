import {
  FAILED_ATTEMPTS_MUST_BE_NON_NEGATIVE,
  MAX_ATTEMPTS_REACHED,
} from '../errors.js'

const MAX_ATTEMPTS = 10

export class EmailOTPRequestValidationPolicy {
  assertCanValidate(failedAttempts: number): void {
    if (failedAttempts < 0) {
      throw new Error(FAILED_ATTEMPTS_MUST_BE_NON_NEGATIVE)
    }
    if (failedAttempts >= MAX_ATTEMPTS) {
      throw new Error(MAX_ATTEMPTS_REACHED)
    }
  }
}
