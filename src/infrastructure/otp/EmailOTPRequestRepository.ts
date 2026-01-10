import { EmailOTPRequest } from '../../domain/entities/EmailOTPRequest.js'
import { Email } from '../../domain/valueObjects/Email.js'

export type EmailOTPRequestRepositoryResult = {
  repository: EmailOTPRequestRepository
  request: EmailOTPRequest
}

export interface EmailOTPRequestRepository {
  create(params: { request: EmailOTPRequest }): EmailOTPRequestRepositoryResult
  read(params: { request: EmailOTPRequest }): EmailOTPRequest
  readLatestByEmail(params: {
    email: Email
  }): { request: EmailOTPRequest; count: number } | null
  update(params: { request: EmailOTPRequest }): EmailOTPRequestRepositoryResult
  delete(params: { request: EmailOTPRequest }): EmailOTPRequestRepositoryResult
}

export class InMemoryEmailOTPRequestRepository implements EmailOTPRequestRepository {
  private readonly items: Map<string, EmailOTPRequest>

  constructor(params?: { items?: Map<string, EmailOTPRequest> }) {
    this.items = new Map(params?.items ?? [])
  }

  create(params: { request: EmailOTPRequest }): EmailOTPRequestRepositoryResult {
    const { request } = params
    const key = this.buildKey({ request })
    if (this.items.has(key)) {
      throw new Error('Email OTP request already exists')
    }
    const nextItems = new Map(this.items)
    nextItems.set(key, request)
    return { repository: new InMemoryEmailOTPRequestRepository({ items: nextItems }), request }
  }

  read(params: { request: EmailOTPRequest }): EmailOTPRequest {
    const { request } = params
    const key = this.buildKey({ request })
    const stored = this.items.get(key)
    if (!stored) {
      throw new Error('Email OTP request not found')
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

  update(params: { request: EmailOTPRequest }): EmailOTPRequestRepositoryResult {
    const { request } = params
    const key = this.buildKey({ request })
    if (!this.items.has(key)) {
      throw new Error('Email OTP request not found')
    }
    const nextItems = new Map(this.items)
    nextItems.set(key, request)
    return { repository: new InMemoryEmailOTPRequestRepository({ items: nextItems }), request }
  }

  delete(params: { request: EmailOTPRequest }): EmailOTPRequestRepositoryResult {
    const { request } = params
    const key = this.buildKey({ request })
    if (!this.items.has(key)) {
      throw new Error('Email OTP request not found')
    }
    const nextItems = new Map(this.items)
    nextItems.delete(key)
    return { repository: new InMemoryEmailOTPRequestRepository({ items: nextItems }), request }
  }

  private buildKey(params: { request: EmailOTPRequest }): string {
    const { request } = params
    return `${request.getEmail().getValue()}::${request.getRequestedAt().toISOString()}`
  }
}
