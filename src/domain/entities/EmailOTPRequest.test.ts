import { describe, expect, it } from 'vitest'
import { Email } from '../valueObjects/Email.js'
import { EmailOTPRequest } from './EmailOTPRequest.js'

describe('EmailOTPRequest', () => {
  it('expires 60 minutes after creation', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')
    const passcode = '123456'
    const failedAttempts = 0

    // Act
    const request = EmailOTPRequest.create({
      email,
      requestedAt,
      passcode,
      failedAttempts,
    })

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
    const passcode = '123456'
    const failedAttempts = 0

    // Act
    const result = EmailOTPRequest.createWithWait({
      email,
      previousRequestCount: 1,
      requestedAt,
      lastRequestedAt,
      passcode,
      failedAttempts,
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
    const passcode = '123456'
    const failedAttempts = 0

    // Act + Assert
    expect(() =>
      EmailOTPRequest.createWithWait({
        email,
        previousRequestCount: 1,
        requestedAt,
        lastRequestedAt,
        passcode,
        failedAttempts,
      }),
    ).toThrow('Hors delai pour la demande')
  })

  it('throws for a fourth request outside the allowed delay', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:30:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')
    const passcode = '123456'
    const failedAttempts = 0

    // Act + Assert
    expect(() =>
      EmailOTPRequest.createWithWait({
        email,
        previousRequestCount: 3,
        requestedAt,
        lastRequestedAt,
        passcode,
        failedAttempts,
      }),
    ).toThrow('Hors delai pour la demande')
  })

  it('throws when attempts exceed the limit before 60 minutes', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:30:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')
    const passcode = '123456'
    const failedAttempts = 0

    // Act + Assert
    expect(() =>
      EmailOTPRequest.createWithWait({
        email,
        previousRequestCount: 1,
        previousFailedAttempts: 11,
        requestedAt,
        lastRequestedAt,
        passcode,
        failedAttempts,
      }),
    ).toThrow('Hors delai pour la demande')
  })

  it('allows a new request after 60 minutes and returns the normal delay', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T01:00:00.000Z')
    const email = Email.create('user@example.com')
    const lastRequestedAt = new Date('2024-01-01T00:00:00.000Z')
    const passcode = '123456'
    const failedAttempts = 0

    // Act
    const result = EmailOTPRequest.createWithWait({
      email,
      previousRequestCount: 1,
      previousFailedAttempts: 11,
      requestedAt,
      lastRequestedAt,
      passcode,
      failedAttempts,
    })

    // Assert
    expect(result.waitMs).toBe(120000)
    expect(result.nextAllowedAt.toISOString()).toBe('2024-01-01T01:02:00.000Z')
  })

  it('stores passcode and failed attempts', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')
    const passcode = '654321'
    const failedAttempts = 2

    // Act
    const request = EmailOTPRequest.create({
      email,
      requestedAt,
      passcode,
      failedAttempts,
    })

    // Assert
    expect(request.getPasscode()).toBe(passcode)
    expect(request.getFailedAttempts()).toBe(failedAttempts)
  })

  it('validates the passcode when attempts are available', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')
    const passcode = '654321'
    const failedAttempts = 9

    // Act
    const request = EmailOTPRequest.create({
      email,
      requestedAt,
      passcode,
      failedAttempts,
    })
    const result = request.validate({ inputPasscode: '654321' })

    // Assert
    expect(result.isValid).toBe(true)
  })

  it('returns invalid when the passcode does not match', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')
    const passcode = '654321'
    const failedAttempts = 0

    // Act
    const request = EmailOTPRequest.create({
      email,
      requestedAt,
      passcode,
      failedAttempts,
    })
    const result = request.validate({ inputPasscode: '000000' })

    // Assert
    expect(result.isValid).toBe(false)
  })

  it('throws when attempts exceed the limit during validation', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')
    const passcode = '654321'
    const failedAttempts = 10

    // Act
    const request = EmailOTPRequest.create({
      email,
      requestedAt,
      passcode,
      failedAttempts,
    })

    // Assert
    expect(() => request.validate({ inputPasscode: '654321' })).toThrow(
      'Nombre maximum de tentatives atteint',
    )
  })

  it('increments failed attempts when called', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const email = Email.create('user@example.com')
    const passcode = '654321'
    const failedAttempts = 3

    // Act
    const request = EmailOTPRequest.create({
      email,
      requestedAt,
      passcode,
      failedAttempts,
    })
    const nextRequest = request.incrementFailedAttempts()

    // Assert
    expect(nextRequest.getFailedAttempts()).toBe(4)
    expect(request.getFailedAttempts()).toBe(3)
  })
})
