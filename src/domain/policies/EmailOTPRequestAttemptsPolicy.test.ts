import { describe, expect, it } from 'vitest'
import { OTP_REQUEST_OUT_OF_DELAY } from '../errors.js'
import { EmailOTPRequestAttemptsPolicy } from './EmailOTPRequestAttemptsPolicy.js'

describe('EmailOTPRequestAttemptsPolicy', () => {
  it('returns no delay up to 10 failed attempts', () => {
    // Arrange
    const policy = new EmailOTPRequestAttemptsPolicy()

    // Act
    const delayAtZero = policy.getDelayMs(0)
    const delayAtTen = policy.getDelayMs(10)

    // Assert
    expect(delayAtZero).toBe(0)
    expect(delayAtTen).toBe(0)
  })

  it('returns 60 minutes from the 11th failed attempt', () => {
    // Arrange
    const policy = new EmailOTPRequestAttemptsPolicy()

    // Act
    const delayAtEleven = policy.getDelayMs(11)

    // Assert
    expect(delayAtEleven).toBe(3600000)
  })

  it('throws when attempts exceed the limit before 60 minutes', () => {
    // Arrange
    const policy = new EmailOTPRequestAttemptsPolicy()
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')
    const now = new Date('2024-01-01T00:30:00.000Z')

    // Act + Assert
    expect(() =>
      policy.assertCanRequest(11, lastRequestedAt, now),
    ).toThrow(OTP_REQUEST_OUT_OF_DELAY)
})
})
