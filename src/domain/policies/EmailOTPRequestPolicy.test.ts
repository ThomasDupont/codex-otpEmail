import { describe, expect, it } from 'vitest'
import { EmailOTPRequestPolicy } from './EmailOTPRequestPolicy.js'

describe('EmailOTPRequestPolicy', () => {
  it('returns 0 for the first request and 120 seconds for the next two', () => {
    // Arrange
    const policy = new EmailOTPRequestPolicy()

    // Act
    const firstDelay = policy.getNextDelayMs(0)
    const secondDelay = policy.getNextDelayMs(1)
    const thirdDelay = policy.getNextDelayMs(2)

    // Assert
    expect(firstDelay).toBe(0)
    expect(secondDelay).toBe(120000)
    expect(thirdDelay).toBe(120000)
  })

  it('returns 60 minutes from the fourth request', () => {
    // Arrange
    const policy = new EmailOTPRequestPolicy()

    // Act
    const fourthDelay = policy.getNextDelayMs(3)
    const fifthDelay = policy.getNextDelayMs(4)

    // Assert
    expect(fourthDelay).toBe(3600000)
    expect(fifthDelay).toBe(3600000)
  })

  it('throws when a request is made before the allowed delay', () => {
    // Arrange
    const policy = new EmailOTPRequestPolicy()
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')
    const now = new Date('2024-01-01T00:01:00.000Z')

    // Act + Assert
    expect(() =>
      policy.assertCanRequest(1, lastRequestedAt, now),
    ).toThrow('Hors delai pour la demande')
  })

  it('throws when the fourth request is made before 60 minutes', () => {
    // Arrange
    const policy = new EmailOTPRequestPolicy()
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')
    const now = new Date('2024-01-01T00:30:00.000Z')

    // Act + Assert
    expect(() =>
      policy.assertCanRequest(3, lastRequestedAt, now),
    ).toThrow('Hors delai pour la demande')
  })
})
