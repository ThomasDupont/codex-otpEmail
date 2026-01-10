import { describe, expect, it } from 'vitest'
import { Email } from '../../domain/valueObjects/Email.js'
import { EmailOTPRequest } from '../../domain/entities/EmailOTPRequest.js'
import { InMemoryEmailOTPRequestRepository } from './EmailOTPRequestRepository.js'

describe('InMemoryEmailOTPRequestRepository', () => {
  it('creates and reads a request', () => {
    // Arrange
    const repository = new InMemoryEmailOTPRequestRepository()
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt: new Date('2024-01-01T00:00:00.000Z'),
      passcode: '123456',
      failedAttempts: 0,
    })

    // Act
    const created = repository.create({ request })
    const stored = created.repository.read({ request })

    // Assert
    expect(stored.getPasscode()).toBe('123456')
    expect(stored.getEmail().getValue()).toBe('user@example.com')
  })

  it('updates an existing request', () => {
    // Arrange
    const repository = new InMemoryEmailOTPRequestRepository()
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt: new Date('2024-01-01T00:00:00.000Z'),
      passcode: '123456',
      failedAttempts: 0,
    })
    const created = repository.create({ request })
    const updated = request.incrementFailedAttempts()

    // Act
    const result = created.repository.update({ request: updated })
    const stored = result.repository.read({ request: updated })

    // Assert
    expect(stored.getFailedAttempts()).toBe(1)
  })

  it('deletes a request', () => {
    // Arrange
    const repository = new InMemoryEmailOTPRequestRepository()
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt: new Date('2024-01-01T00:00:00.000Z'),
      passcode: '123456',
      failedAttempts: 0,
    })
    const created = repository.create({ request })

    // Act
    const result = created.repository.delete({ request })

    // Assert
    expect(() => result.repository.read({ request })).toThrow(
      'Email OTP request not found',
    )
  })
})
