import { Email } from '../valueObjects/Email.js'

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

  static create(email: Email, requestedAt: Date = new Date()): EmailOTPRequest {
    const expiresAt = new Date(requestedAt.getTime() + VALIDITY_DURATION_MS)
    return new EmailOTPRequest(email, requestedAt, expiresAt)
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

  isValid(at: Date = new Date()): boolean {
    return at.getTime() <= this.expiresAt.getTime()
  }
}
