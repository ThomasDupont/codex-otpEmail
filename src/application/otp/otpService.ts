import { Email } from '../../domain/valueObjects/Email.js'
import { EmailOTPRequest } from '../../domain/entities/EmailOTPRequest.js'
import type { EmailOTPRequestRepository } from '../../infrastructure/otp/EmailOTPRequestRepository.js'

export type Clock = {
  now: () => Date
}

export type CreateOtpRequestResult = {
  request: EmailOTPRequest
  waitMs: number
  nextAllowedAt: Date
}

export const createOtpRequest = (params: {
  email: string
  previousRequestCount: number
  previousFailedAttempts: number
  lastRequestedAt?: Date
  repository: EmailOTPRequestRepository
  clock: Clock
  passcodeGenerator: () => string
}): CreateOtpRequestResult => {
  const {
    email,
    previousRequestCount,
    previousFailedAttempts,
    lastRequestedAt,
    repository,
    clock,
    passcodeGenerator,
  } = params
  const emailValue = Email.create(email)
  const requestedAt = clock.now()
  const passcode = passcodeGenerator()
  const failedAttempts = 0

  const requestParams = {
    email: emailValue,
    previousRequestCount,
    previousFailedAttempts,
    requestedAt,
    passcode,
    failedAttempts,
    ...(lastRequestedAt ? { lastRequestedAt } : {}),
  }
  const result = EmailOTPRequest.createWithWait(requestParams)
  repository.create({ request: result.request })

  return {
    request: result.request,
    waitMs: result.waitMs,
    nextAllowedAt: result.nextAllowedAt,
  }
}

export type ValidateOtpRequestResult = {
  isValid: boolean
  failedAttempts: number
}

export const validateOtpRequest = (params: {
  email: string
  requestedAt: Date
  inputPasscode: string
  repository: EmailOTPRequestRepository
}): ValidateOtpRequestResult => {
  const { email, requestedAt, inputPasscode, repository } = params
  const emailValue = Email.create(email)
  const lookup = EmailOTPRequest.create({
    email: emailValue,
    requestedAt,
    passcode: '',
    failedAttempts: 0,
  })
  const stored = repository.read({ request: lookup })
  const validation = stored.validate({ inputPasscode })

  if (!validation.isValid) {
    const updated = stored.incrementFailedAttempts()
    repository.update({ request: updated })
    return {
      isValid: false,
      failedAttempts: updated.getFailedAttempts(),
    }
  }

  return {
    isValid: true,
    failedAttempts: stored.getFailedAttempts(),
  }
}
