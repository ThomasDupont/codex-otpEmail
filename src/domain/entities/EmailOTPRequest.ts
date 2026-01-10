import { Email } from '../valueObjects/Email.js'
import { EmailOTPRequestPolicy } from '../policies/EmailOTPRequestPolicy.js'
import { timingSafeEqual } from 'node:crypto'
import { EmailOTPRequestAttemptsPolicy } from '../policies/EmailOTPRequestAttemptsPolicy.js'
import { EmailOTPRequestValidationPolicy } from '../policies/EmailOTPRequestValidationPolicy.js'

const VALIDITY_DURATION_MS = 60 * 60 * 1000

export class EmailOTPRequest {
  private readonly email: Email
  private readonly requestedAt: Date
  private readonly expiresAt: Date
  private readonly passcode: string
  private readonly failedAttempts: number

  private constructor(
    email: Email,
    requestedAt: Date,
    expiresAt: Date,
    passcode: string,
    failedAttempts: number,
  ) {
    this.email = email
    this.requestedAt = requestedAt
    this.expiresAt = expiresAt
    this.passcode = passcode
    this.failedAttempts = failedAttempts
  }

  static create(params: {
    email: Email
    requestedAt: Date
    passcode: string
    failedAttempts: number
  }): EmailOTPRequest {
    const { email, requestedAt, passcode, failedAttempts } = params
    const expiresAt = new Date(requestedAt.getTime() + VALIDITY_DURATION_MS)
    return new EmailOTPRequest(email, requestedAt, expiresAt, passcode, failedAttempts)
  }

  static createWithWait(params: {
    email: Email
    previousRequestCount: number
    requestedAt: Date
    lastRequestedAt?: Date
    policy?: EmailOTPRequestPolicy
    previousFailedAttempts?: number
    attemptsPolicy?: EmailOTPRequestAttemptsPolicy
    passcode: string
    failedAttempts: number
  }): { request: EmailOTPRequest; waitMs: number; nextAllowedAt: Date } {
    const {
      email,
      previousRequestCount,
      requestedAt,
      lastRequestedAt,
      policy = new EmailOTPRequestPolicy(),
      previousFailedAttempts = 0,
      attemptsPolicy = new EmailOTPRequestAttemptsPolicy(),
      passcode,
      failedAttempts,
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
    const request = EmailOTPRequest.create({
      email,
      requestedAt,
      passcode,
      failedAttempts,
    })
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

  getPasscode(): string {
    return this.passcode
  }

  getFailedAttempts(): number {
    return this.failedAttempts
  }

  incrementFailedAttempts(): EmailOTPRequest {
    return new EmailOTPRequest(
      this.email,
      this.requestedAt,
      this.expiresAt,
      this.passcode,
      this.failedAttempts + 1,
    )
  }

  validate(params: {
    inputPasscode: string
    policy?: EmailOTPRequestValidationPolicy
  }): { isValid: boolean } {
    const { inputPasscode, policy = new EmailOTPRequestValidationPolicy() } = params
    policy.assertCanValidate(this.failedAttempts)
    const isValid = timingSafeEqual(
      Buffer.from(this.passcode),
      Buffer.from(inputPasscode),
    )
    return { isValid }
  }

  isValid(at: Date): boolean {
    return at.getTime() <= this.expiresAt.getTime()
  }
}
