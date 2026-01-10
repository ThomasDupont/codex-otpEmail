const MAX_ATTEMPTS = 10

export class EmailOTPRequestValidationPolicy {
  assertCanValidate(failedAttempts: number): void {
    if (failedAttempts < 0) {
      throw new Error('Failed attempts must be non-negative')
    }
    if (failedAttempts >= MAX_ATTEMPTS) {
      throw new Error('Nombre maximum de tentatives atteint')
    }
  }
}
