import type { Express } from 'express'

export const registerPingRoute = (app: Express): void => {
  app.get('/ping', (_req, res) => {
    res.type('text/plain').send('pong')
  })
}
