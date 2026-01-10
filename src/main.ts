import express from 'express'
import { randomInt } from 'node:crypto'
import { registerPingRoute } from './application/http/pingRoute.js'
import { registerOtpRoutes } from './application/http/otpRoutes.js'
import { InMemoryEmailOTPRequestRepository } from './infrastructure/otp/EmailOTPRequestRepository.js'

const app = express()
app.use(express.json())

registerPingRoute(app)
registerOtpRoutes({
  app,
  repository: new InMemoryEmailOTPRequestRepository(),
  clock: { now: () => new Date() },
  passcodeGenerator: () => String(randomInt(100000, 1000000)),
})

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
