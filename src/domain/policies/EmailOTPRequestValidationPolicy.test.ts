import { describe, expect, it } from 'vitest'
import { EmailOTPRequestValidationPolicy } from './EmailOTPRequestValidationPolicy.js'

describe('EmailOTPRequestValidationPolicy', () => {
  it('allows validation up to 9 failed attempts', () => {
    // Arrange
    const policy = new EmailOTPRequestValidationPolicy()

    // Act
    const validate = () => policy.assertCanValidate(9)

    // Assert
    expect(validate).not.toThrow()
  })

  it('blocks validation from the 10th failed attempt', () => {
    // Arrange
    const policy = new EmailOTPRequestValidationPolicy()

    // Act + Assert
    expect(() => policy.assertCanValidate(10)).toThrow(
      'Nombre maximum de tentatives atteint',
    )
  })
})
