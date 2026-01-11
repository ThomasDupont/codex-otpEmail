import { describe, expect, it } from 'vitest'
import { OTP_REQUEST_NOT_FOUND } from '../../domain/errors.js'
import { Email } from '../../domain/valueObjects/Email.js'
import { EmailOTPRequest } from '../../domain/entities/EmailOTPRequest.js'
import { createInMemoryEmailOTPRequestRepository } from './EmailOTPRequestRepository.js'

describe('InMemoryEmailOTPRequestRepository', () => {
  it('creates and reads a request', () => {
    // Arrange
    const repository = createInMemoryEmailOTPRequestRepository({ state: new Map() })
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt: new Date('2024-01-01T00:00:00.000Z'),
      passcode: '123456',
      failedAttempts: 0,
    })

    // Act
    repository.create({ request })
    const stored = repository.read({ request })

    // Assert
    expect(stored.getPasscode()).toBe('123456')
    expect(stored.getEmail().getValue()).toBe('user@example.com')
  })

  it('updates an existing request', () => {
    // Arrange
    const repository = createInMemoryEmailOTPRequestRepository({ state: new Map() })
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt: new Date('2024-01-01T00:00:00.000Z'),
      passcode: '123456',
      failedAttempts: 0,
    })
    repository.create({ request })
    const updated = request.incrementFailedAttempts()

    // Act
    repository.update({ request: updated })
    const stored = repository.read({ request: updated })

    // Assert
    expect(stored.getFailedAttempts()).toBe(1)
  })

  it('deletes a request', () => {
    // Arrange
    const repository = createInMemoryEmailOTPRequestRepository({ state: new Map() })
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt: new Date('2024-01-01T00:00:00.000Z'),
      passcode: '123456',
      failedAttempts: 0,
    })
    repository.create({ request })

    // Act
    repository.delete({ request })

    // Assert
    expect(() => repository.read({ request })).toThrow(OTP_REQUEST_NOT_FOUND)
  })

  it('reads the latest request for an email', () => {
    // Arrange
    const repository = createInMemoryEmailOTPRequestRepository({ state: new Map() })
    const email = Email.create('user@example.com')
    const firstRequest = EmailOTPRequest.create({
      email,
      requestedAt: new Date('2024-01-01T00:00:00.000Z'),
      passcode: '111111',
      failedAttempts: 0,
    })
    const secondRequest = EmailOTPRequest.create({
      email,
      requestedAt: new Date('2024-01-01T01:00:00.000Z'),
      passcode: '222222',
      failedAttempts: 1,
    })

    // Act
    repository.create({ request: firstRequest })
    repository.create({ request: secondRequest })
    const latest = repository.readLatestByEmail({ email })

    // Assert
    expect(latest?.count).toBe(2)
    expect(latest?.request.getPasscode()).toBe('222222')
  })
})
