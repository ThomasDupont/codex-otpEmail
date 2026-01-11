import { randomInt } from 'node:crypto'
import { Email } from '../../domain/valueObjects/Email.js'
import { createInMemoryEmailOTPRequestRepository } from '../../infrastructure/otp/EmailOTPRequestRepository.js'
import type { EmailOTPRequestRepository } from '../../infrastructure/otp/EmailOTPRequestRepository.js'
import type { Clock } from '../otp/otpService.js'
import {
  createOtpRequest,
  type CreateOtpRequestResult,
  type ValidateOtpRequestResult,
  validateOtpRequest,
} from '../otp/otpService.js'

export type OtpUseCases = {
  requestOtp: (params: { email: string }) => CreateOtpRequestResult
  validateOtp: (params: {
    email: string
    requestedAt: Date
    inputPasscode: string
  }) => ValidateOtpRequestResult
}

export const createOtpUseCases = (params?: {
  repository?: EmailOTPRequestRepository
  clock?: Clock
  passcodeGenerator?: () => string
}): OtpUseCases => {
  const repository = params?.repository ?? createInMemoryEmailOTPRequestRepository()
  const clock = params?.clock ?? { now: () => new Date() }
  const passcodeGenerator =
    params?.passcodeGenerator ?? (() => String(randomInt(100000, 1000000)))

  const requestOtp = (requestParams: { email: string }): CreateOtpRequestResult => {
    const emailValue = Email.create(requestParams.email)
    const latest = repository.readLatestByEmail({ email: emailValue })
    const previousRequestCount = latest?.count ?? 0
    const previousFailedAttempts = latest?.request.getFailedAttempts() ?? 0
    const lastRequestedAt = latest?.request.getRequestedAt()
    const createParams = {
      email: requestParams.email,
      previousRequestCount,
      previousFailedAttempts,
      repository,
      clock,
      passcodeGenerator,
      ...(lastRequestedAt ? { lastRequestedAt } : {}),
    }
    return createOtpRequest(createParams)
  }

  const validateOtp = (requestParams: {
    email: string
    requestedAt: Date
    inputPasscode: string
  }): ValidateOtpRequestResult =>
    validateOtpRequest({
      email: requestParams.email,
      requestedAt: requestParams.requestedAt,
      inputPasscode: requestParams.inputPasscode,
      repository,
    })

  return { requestOtp, validateOtp }
}
