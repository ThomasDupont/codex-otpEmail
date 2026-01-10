import express from 'express'
import { registerPingRoute } from './application/http/pingRoute.js'

const app = express()

registerPingRoute(app)

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
