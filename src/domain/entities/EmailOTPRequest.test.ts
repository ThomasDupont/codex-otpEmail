import { describe, expect, it } from 'vitest'
import { Email } from '../valueObjects/Email.js'
import { EmailOTPRequest } from './EmailOTPRequest.js'

describe('EmailOTPRequest', () => {
  it('expires 60 minutes after creation', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')

    // Act
    const request = EmailOTPRequest.create(email, requestedAt)

    // Assert
    expect(request.getRequestedAt().toISOString()).toBe(requestedAt.toISOString())
    expect(request.getExpiresAt().toISOString()).toBe('2024-01-01T01:00:00.000Z')
    expect(request.isValid(new Date('2024-01-01T00:59:59.999Z'))).toBe(true)
    expect(request.isValid(new Date('2024-01-01T01:00:00.000Z'))).toBe(true)
    expect(request.isValid(new Date('2024-01-01T01:00:00.001Z'))).toBe(false)
  })

  it('returns the wait time for the next request', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:02:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')

    // Act
    const result = EmailOTPRequest.createWithWait({
      email,
      previousRequestCount: 1,
      requestedAt,
      lastRequestedAt,
    })

    // Assert
    expect(result.waitMs).toBe(120000)
    expect(result.nextAllowedAt.toISOString()).toBe('2024-01-01T00:04:00.000Z')
  })

  it('throws when requesting too soon', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:01:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:30.000Z')

    // Act + Assert
    expect(() =>
      EmailOTPRequest.createWithWait({
        email,
        previousRequestCount: 1,
        requestedAt,
        lastRequestedAt,
      }),
    ).toThrow('Hors delai pour la demande')
  })

  it('throws for a fourth request outside the allowed delay', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:30:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')

    // Act + Assert
    expect(() =>
      EmailOTPRequest.createWithWait({
        email,
        previousRequestCount: 3,
        requestedAt,
        lastRequestedAt,
      }),
    ).toThrow('Hors delai pour la demande')
  })

  it('throws when attempts exceed the limit before 60 minutes', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:30:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')

    // Act + Assert
    expect(() =>
      EmailOTPRequest.createWithWait({
        email,
        previousRequestCount: 1,
        previousFailedAttempts: 11,
        requestedAt,
        lastRequestedAt,
      }),
    ).toThrow('Hors delai pour la demande')
  })

  it('allows a new request after 60 minutes and returns the normal delay', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T01:00:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')

    // Act
    const result = EmailOTPRequest.createWithWait({
      email,
      previousRequestCount: 1,
      previousFailedAttempts: 11,
      requestedAt,
      lastRequestedAt,
    })

    // Assert
    expect(result.waitMs).toBe(120000)
    expect(result.nextAllowedAt.toISOString()).toBe('2024-01-01T01:02:00.000Z')
  })
})
