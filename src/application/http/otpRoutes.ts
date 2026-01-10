import type { Express } from 'express'
import { Email } from '../../domain/valueObjects/Email.js'
import type { EmailOTPRequestRepository } from '../../infrastructure/otp/EmailOTPRequestRepository.js'
import type { Clock } from '../otp/otpService.js'
import { createOtpRequest, validateOtpRequest } from '../otp/otpService.js'

export const registerOtpRoutes = (params: {
  app: Express
  repository: EmailOTPRequestRepository
  clock: Clock
  passcodeGenerator: () => string
}): void => {
  const { app, clock, passcodeGenerator } = params
  let repository = params.repository

  app.post('/otp/request', (req, res) => {
    try {
      const body = req.body as {
        email: string
      }
      const emailValue = Email.create(body.email)
      const latest = repository.readLatestByEmail({ email: emailValue })

      console.log('Latest request:', latest)
      const previousRequestCount = latest?.count ?? 0
      const previousFailedAttempts = latest?.request.getFailedAttempts() ?? 0
      const lastRequestedAt = latest?.request.getRequestedAt()
      const requestParams = {
        email: body.email,
        previousRequestCount,
        previousFailedAttempts,
        repository,
        clock,
        passcodeGenerator,
        ...(lastRequestedAt ? { lastRequestedAt } : {}),
      }
      const result = createOtpRequest(requestParams)
      repository = result.repository
      res.json({
        email: result.request.getEmail().getValue(),
        requestedAt: result.request.getRequestedAt().toISOString(),
        expiresAt: result.request.getExpiresAt().toISOString(),
        passcode: result.request.getPasscode(),
        waitMs: result.waitMs,
        nextAllowedAt: result.nextAllowedAt.toISOString(),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error'
      res.status(400).json({ error: message })
    }
  })

  app.post('/otp/validation', (req, res) => {
    try {
      const body = req.body as {
        email: string
        requestedAt: string
        inputPasscode: string
      }
      const result = validateOtpRequest({
        email: body.email,
        requestedAt: new Date(body.requestedAt),
        inputPasscode: body.inputPasscode,
        repository,
      })
      repository = result.repository
      res.json({
        isValid: result.isValid,
        failedAttempts: result.failedAttempts,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error'
      res.status(400).json({ error: message })
    }
  })
}
