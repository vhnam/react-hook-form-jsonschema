import type { RegisterOptions } from 'react-hook-form'

import { getStringValidator } from '../getStringValidator'
import { ErrorTypes } from '../../../utils/errorTypes'

const getValidateFn = (
  options: RegisterOptions
): ((value: unknown) => unknown) => {
  return options.validate as (value: unknown) => unknown
}

describe('getStringValidator', () => {
  test('adds length and pattern constraints', () => {
    const validator = getStringValidator(
      {
        type: 'string',
        minLength: 2,
        maxLength: 4,
        pattern: '^[a-z]+$',
      },
      {}
    )

    expect(validator.minLength).toEqual({
      value: 2,
      message: ErrorTypes.minLength,
    })
    expect(validator.maxLength).toEqual({
      value: 4,
      message: ErrorTypes.maxLength,
    })
    expect(validator.pattern).toEqual({
      value: /^[a-z]+$/,
      message: ErrorTypes.pattern,
    })
  })

  test('validates optional empty strings against minLength', () => {
    const validate = getValidateFn(
      getStringValidator({ type: 'string', minLength: 1 }, {})
    )

    expect(validate('')).toBe(ErrorTypes.minLength)
    expect(validate('x')).toBe(true)
  })

  test('skips minLength for nullish and non-string values', () => {
    const validate = getValidateFn(
      getStringValidator({ type: 'string', minLength: 1 }, {})
    )

    expect(validate(undefined)).toBe(true)
    expect(validate(null)).toBe(true)
    expect(validate(123)).toBe(true)
  })

  test('preserves an existing validator failure', () => {
    const customValidate = jest.fn(() => ErrorTypes.pattern)
    const validate = getValidateFn(
      getStringValidator(
        { type: 'string', minLength: 2 },
        { validate: customValidate }
      )
    )

    expect(validate('x')).toBe(ErrorTypes.pattern)
    expect(customValidate).toHaveBeenCalledWith('x', {})
  })

  test('runs minLength after an existing async validator passes', async () => {
    const customValidate = jest.fn(() => Promise.resolve(true))
    const validate = getValidateFn(
      getStringValidator(
        { type: 'string', minLength: 2 },
        { validate: customValidate }
      )
    )

    await expect(validate('x')).resolves.toBe(ErrorTypes.minLength)
    expect(customValidate).toHaveBeenCalledWith('x', {})
  })

  test('preserves existing object validator failures', () => {
    const firstValidator = jest.fn(() => true)
    const secondValidator = jest.fn(() => ErrorTypes.notInEnum)
    const validate = getValidateFn(
      getStringValidator(
        { type: 'string', minLength: 2 },
        {
          validate: {
            firstValidator,
            secondValidator,
          },
        }
      )
    )

    expect(validate('x')).toBe(ErrorTypes.notInEnum)
    expect(firstValidator).toHaveBeenCalledWith('x', {})
    expect(secondValidator).toHaveBeenCalledWith('x', {})
  })

  test('validates supported format values', () => {
    const validate = getValidateFn(
      getStringValidator({ type: 'string', format: 'email' }, {})
    )

    expect(validate('user@example.com')).toBe(true)
    expect(validate('user.example.com')).toBe(ErrorTypes.format)
  })

  test('accepts native time and datetime-local input values for tier 1 formats', () => {
    const timeValidate = getValidateFn(
      getStringValidator({ type: 'string', format: 'time' }, {})
    )
    const dateTimeValidate = getValidateFn(
      getStringValidator({ type: 'string', format: 'date-time' }, {})
    )

    expect(timeValidate('09:30')).toBe(true)
    expect(timeValidate('24:00')).toBe(ErrorTypes.format)
    expect(dateTimeValidate('2026-05-20T09:30')).toBe(true)
    expect(dateTimeValidate('2026-02-29T09:30')).toBe(ErrorTypes.format)
  })

  test('runs format validation after existing validators pass', () => {
    const customValidate = jest.fn(() => true)
    const validate = getValidateFn(
      getStringValidator(
        { type: 'string', format: 'uuid' },
        { validate: customValidate }
      )
    )

    expect(validate('invalid-uuid')).toBe(ErrorTypes.format)
    expect(customValidate).toHaveBeenCalledWith('invalid-uuid', {})
  })

  test('does not add validation for unsupported formats', () => {
    const validator = getStringValidator(
      { type: 'string', format: 'custom-format' },
      {}
    )

    expect(validator.validate).toBeUndefined()
  })

  test('skips format validation for nullish and non-string values', () => {
    const validate = getValidateFn(
      getStringValidator({ type: 'string', format: 'email' }, {})
    )

    expect(validate(undefined)).toBe(true)
    expect(validate(null)).toBe(true)
    expect(validate(123)).toBe(true)
  })

  test('runs format validation after an existing async validator passes', async () => {
    const customValidate = jest.fn(() => Promise.resolve(true))
    const validate = getValidateFn(
      getStringValidator(
        { type: 'string', format: 'email' },
        { validate: customValidate }
      )
    )

    await expect(validate('user.example.com')).resolves.toBe(ErrorTypes.format)
    expect(customValidate).toHaveBeenCalledWith('user.example.com', {})
  })

  test('preserves an existing async validator failure before format validation', async () => {
    const customValidate = jest.fn(() => Promise.resolve(ErrorTypes.pattern))
    const validate = getValidateFn(
      getStringValidator(
        { type: 'string', format: 'email' },
        { validate: customValidate }
      )
    )

    await expect(validate('user.example.com')).resolves.toBe(ErrorTypes.pattern)
    expect(customValidate).toHaveBeenCalledWith('user.example.com', {})
  })

  test('runs minLength before format validation', () => {
    const validate = getValidateFn(
      getStringValidator(
        { type: 'string', minLength: 20, format: 'email' },
        {}
      )
    )

    expect(validate('invalid')).toBe(ErrorTypes.minLength)
  })
})
