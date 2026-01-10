import { describe, expect, it } from 'vitest'
import { Email } from './Email.js'

describe('Email', () => {
  it('normalizes and creates a valid email', () => {
    const email = Email.create('  User@Example.com ')

    expect(email.getValue()).toBe('user@example.com')
  })

  it('rejects invalid emails', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email')
  })

  it('compares emails by value', () => {
    const first = Email.create('user@example.com')
    const second = Email.create('User@Example.com')

    expect(first.equals(second)).toBe(true)
  })
})
