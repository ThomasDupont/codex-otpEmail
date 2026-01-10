import { describe, expect, it } from 'vitest'
import { Email } from '../../domain/valueObjects/Email.js'
import { EmailOTPRequest } from '../../domain/entities/EmailOTPRequest.js'
import { InMemoryEmailOTPRequestRepository } from '../../infrastructure/otp/EmailOTPRequestRepository.js'
import { createOtpRequest, validateOtpRequest } from './otpService.js'

describe('otpService', () => {
  it('creates and persists an OTP request', () => {
    // Arrange
    const repository = new InMemoryEmailOTPRequestRepository()
    const clock = { now: () => new Date('2024-01-01T00:00:00.000Z') }
    const passcodeGenerator = () => '123456'

    // Act
    const result = createOtpRequest({
      email: 'user@example.com',
      previousRequestCount: 0,
      previousFailedAttempts: 0,
      repository,
      clock,
      passcodeGenerator,
    })
    const stored = result.repository.read({ request: result.request })

    // Assert
    expect(stored.getPasscode()).toBe('123456')
    expect(result.waitMs).toBe(120000)
  })

  it('increments failed attempts when validation fails', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt,
      passcode: '654321',
      failedAttempts: 0,
    })
    const repository = new InMemoryEmailOTPRequestRepository().create({ request }).repository

    // Act
    const result = validateOtpRequest({
      email: 'user@example.com',
      requestedAt,
      inputPasscode: '000000',
      repository,
    })

    // Assert
    expect(result.isValid).toBe(false)
    expect(result.failedAttempts).toBe(1)
  })

  it('keeps attempts unchanged when validation succeeds', () => {
    // Arrange
    const requestedAt = new Date('2024-01-01T00:00:00.000Z')
    const request = EmailOTPRequest.create({
      email: Email.create('user@example.com'),
      requestedAt,
      passcode: '654321',
      failedAttempts: 2,
    })
    const repository = new InMemoryEmailOTPRequestRepository().create({ request }).repository

    // Act
    const result = validateOtpRequest({
      email: 'user@example.com',
      requestedAt,
      inputPasscode: '654321',
      repository,
    })

    // Assert
    expect(result.isValid).toBe(true)
    expect(result.failedAttempts).toBe(2)
  })
})
