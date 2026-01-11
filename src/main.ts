import express from 'express'
import { registerPingRoute } from './application/http/pingRoute.js'
import { registerOtpRoutes } from './application/http/otpRoutes.js'

const app = express()
app.use(express.json())

registerPingRoute(app)
registerOtpRoutes({
  app,
})

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
