import { Email } from '../valueObjects/Email.js'
import { EmailOTPRequestPolicy } from '../policies/EmailOTPRequestPolicy.js'
import { EmailOTPRequestAttemptsPolicy } from '../policies/EmailOTPRequestAttemptsPolicy.js'

const VALIDITY_DURATION_MS = 60 * 60 * 1000

export class EmailOTPRequest {
  private readonly email: Email
  private readonly requestedAt: Date
  private readonly expiresAt: Date

  private constructor(email: Email, requestedAt: Date, expiresAt: Date) {
    this.email = email
    this.requestedAt = requestedAt
    this.expiresAt = expiresAt
  }

  static create(email: Email, requestedAt: Date): EmailOTPRequest {
    const expiresAt = new Date(requestedAt.getTime() + VALIDITY_DURATION_MS)
    return new EmailOTPRequest(email, requestedAt, expiresAt)
  }

  static createWithWait(params: {
    email: Email
    previousRequestCount: number
    requestedAt: Date
    lastRequestedAt?: Date
    policy?: EmailOTPRequestPolicy
    previousFailedAttempts?: number
    attemptsPolicy?: EmailOTPRequestAttemptsPolicy
  }): { request: EmailOTPRequest; waitMs: number; nextAllowedAt: Date } {
    const {
      email,
      previousRequestCount,
      requestedAt,
      lastRequestedAt,
      policy = new EmailOTPRequestPolicy(),
      previousFailedAttempts = 0,
      attemptsPolicy = new EmailOTPRequestAttemptsPolicy(),
    } = params
    const attemptsDelayMs = attemptsPolicy.getDelayMs(previousFailedAttempts)
    if (previousRequestCount > 0 || attemptsDelayMs > 0) {
      if (!lastRequestedAt) {
        throw new Error('Last request date is required')
      }
      if (previousRequestCount > 0) {
        policy.assertCanRequest(previousRequestCount, lastRequestedAt, requestedAt)
      }
      if (attemptsDelayMs > 0) {
        attemptsPolicy.assertCanRequest(previousFailedAttempts, lastRequestedAt, requestedAt)
      }
    }
    const request = EmailOTPRequest.create(email, requestedAt)
    const requestDelayMs = policy.getNextDelayMs(previousRequestCount + 1)
    const waitMs = requestDelayMs
    const nextAllowedAt = new Date(requestedAt.getTime() + waitMs)
    return { request, waitMs, nextAllowedAt }
  }

  getEmail(): Email {
    return this.email
  }

  getRequestedAt(): Date {
    return this.requestedAt
  }

  getExpiresAt(): Date {
    return this.expiresAt
  }

  isValid(at: Date): boolean {
    return at.getTime() <= this.expiresAt.getTime()
  }
}
