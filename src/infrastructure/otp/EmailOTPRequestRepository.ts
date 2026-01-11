import {
  OTP_REQUEST_ALREADY_EXISTS,
  OTP_REQUEST_NOT_FOUND,
} from '../../domain/errors.js'
import { EmailOTPRequest } from '../../domain/entities/EmailOTPRequest.js'
import { Email } from '../../domain/valueObjects/Email.js'

export interface EmailOTPRequestRepository {
  create(params: { request: EmailOTPRequest }): EmailOTPRequest
  read(params: { request: EmailOTPRequest }): EmailOTPRequest
  readLatestByEmail(params: {
    email: Email
  }): { request: EmailOTPRequest; count: number } | null
  update(params: { request: EmailOTPRequest }): EmailOTPRequest
  delete(params: { request: EmailOTPRequest }): EmailOTPRequest
}

export class InMemoryEmailOTPRequestRepository implements EmailOTPRequestRepository {
  private readonly items: Map<string, EmailOTPRequest>

  constructor(params: { items: Map<string, EmailOTPRequest> }) {
    this.items = params.items
  }

  create(params: { request: EmailOTPRequest }): EmailOTPRequest {
    const { request } = params
    const key = this.buildKey({ request })
    if (this.items.has(key)) {
      throw new Error(OTP_REQUEST_ALREADY_EXISTS)
    }
    this.items.set(key, request)
    return request
  }

  read(params: { request: EmailOTPRequest }): EmailOTPRequest {
    const { request } = params
    const key = this.buildKey({ request })
    const stored = this.items.get(key)
    if (!stored) {
      throw new Error(OTP_REQUEST_NOT_FOUND)
    }
    return stored
  }

  readLatestByEmail(params: {
    email: Email
  }): { request: EmailOTPRequest; count: number } | null {
    const { email } = params
    const matches = [...this.items.values()].filter(
      (request) => request.getEmail().getValue() === email.getValue(),
    )
    if (matches.length === 0) {
      return null
    }
    const latest = matches.reduce((current, candidate) =>
      candidate.getRequestedAt().getTime() > current.getRequestedAt().getTime()
        ? candidate
        : current,
    )
    return { request: latest, count: matches.length }
  }

  update(params: { request: EmailOTPRequest }): EmailOTPRequest {
    const { request } = params
    const key = this.buildKey({ request })
    if (!this.items.has(key)) {
      throw new Error(OTP_REQUEST_NOT_FOUND)
    }
    this.items.set(key, request)
    return request
  }

  delete(params: { request: EmailOTPRequest }): EmailOTPRequest {
    const { request } = params
    const key = this.buildKey({ request })
    if (!this.items.has(key)) {
      throw new Error(OTP_REQUEST_NOT_FOUND)
    }
    this.items.delete(key)
    return request
  }

  private buildKey(params: { request: EmailOTPRequest }): string {
    const { request } = params
    return `${request.getEmail().getValue()}::${request.getRequestedAt().toISOString()}`
  }
}

export type InMemoryEmailOTPRequestState = Map<string, EmailOTPRequest>

const inMemoryEmailOtpRequests: InMemoryEmailOTPRequestState = new Map()

export const createInMemoryEmailOTPRequestRepository = (params?: {
  state?: InMemoryEmailOTPRequestState
}): EmailOTPRequestRepository =>
  new InMemoryEmailOTPRequestRepository({
    items: params?.state ?? inMemoryEmailOtpRequests,
  })
