import type { Express } from 'express'
import { createOtpUseCases } from '../usecases/otpUseCases.js'

export const registerOtpRoutes = (params: {
  app: Express
}): void => {
  const { app } = params
  const { requestOtp, validateOtp } = createOtpUseCases()

  app.post('/otp/request', (req, res) => {
    try {
      const body = req.body as {
        email: string
      }
      const result = requestOtp({ email: body.email })
      res.json({
        email: result.request.getEmail().getValue(),
        requestedAt: result.request.getRequestedAt().toISOString(),
        expiresAt: result.request.getExpiresAt().toISOString(),
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
      const result = validateOtp({
        email: body.email,
        requestedAt: new Date(body.requestedAt),
        inputPasscode: body.inputPasscode,
      })
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
