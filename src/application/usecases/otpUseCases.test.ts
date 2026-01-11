import { describe, expect, it } from 'vitest'
import { createInMemoryEmailOTPRequestRepository } from '../../infrastructure/otp/EmailOTPRequestRepository.js'
import { createOtpUseCases } from './otpUseCases.js'

describe('otpUseCases', () => {
  it('creates and persists an OTP request', () => {
    // Arrange
    const repository = createInMemoryEmailOTPRequestRepository({ state: new Map() })
    const clock = { now: () => new Date('2024-01-01T00:00:00.000Z') }
    const passcodeGenerator = () => '123456'
    const useCases = createOtpUseCases({ repository, clock, passcodeGenerator })

    // Act
    const result = useCases.requestOtp({ email: 'user@example.com' })
    const latest = repository.readLatestByEmail({
      email: result.request.getEmail(),
    })

    // Assert
    expect(result.request.getPasscode()).toBe('123456')
    expect(latest?.count).toBe(1)
  })

  it('increments failed attempts when validation fails', () => {
    // Arrange
    const repository = createInMemoryEmailOTPRequestRepository({ state: new Map() })
    const clock = { now: () => new Date('2024-01-01T00:00:00.000Z') }
    const passcodeGenerator = () => '123456'
    const useCases = createOtpUseCases({ repository, clock, passcodeGenerator })
    const created = useCases.requestOtp({ email: 'user@example.com' })

    // Act
    const result = useCases.validateOtp({
      email: created.request.getEmail().getValue(),
      requestedAt: created.request.getRequestedAt(),
      inputPasscode: '000000',
    })
    const latest = repository.readLatestByEmail({
      email: created.request.getEmail(),
    })

    // Assert
    expect(result.isValid).toBe(false)
    expect(result.failedAttempts).toBe(1)
    expect(latest?.request.getFailedAttempts()).toBe(1)
  })
})
