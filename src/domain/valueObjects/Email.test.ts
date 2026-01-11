import { describe, expect, it } from 'vitest'
import { INVALID_EMAIL } from '../errors.js'
import { Email } from './Email.js'

describe('Email', () => {
  it('normalizes and creates a valid email', () => {
    // Arrange
    const email = Email.create('  User@Example.com ')

    // Act
    const value = email.getValue()

    // Assert
    expect(value).toBe('user@example.com')
  })

  it('rejects invalid emails', () => {
    // Arrange
    const invalidEmail = 'not-an-email'

    // Act + Assert
    expect(() => Email.create(invalidEmail)).toThrow(INVALID_EMAIL)
  })

  it('compares emails by value', () => {
    // Arrange
    const first = Email.create('user@example.com')
    const second = Email.create('User@Example.com')

    // Act
    const isEqual = first.equals(second)

    // Assert
    expect(isEqual).toBe(true)
  })
})
