import { describe, expect, it } from 'vitest'
import { Email } from '../valueObjects/Email.js'
import { EmailOTPRequest } from './EmailOTPRequest.js'

describe('EmailOTPRequest', () => {
  it('expires 60 minutes after creation', () => {
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')

    const request = EmailOTPRequest.create(email, requestedAt)

    expect(request.getRequestedAt().toISOString()).toBe(requestedAt.toISOString())
    expect(request.getExpiresAt().toISOString()).toBe('2024-01-01T01:00:00.000Z')
    expect(request.isValid(new Date('2024-01-01T00:59:59.999Z'))).toBe(true)
    expect(request.isValid(new Date('2024-01-01T01:00:00.000Z'))).toBe(true)
    expect(request.isValid(new Date('2024-01-01T01:00:00.001Z'))).toBe(false)
  })
})
