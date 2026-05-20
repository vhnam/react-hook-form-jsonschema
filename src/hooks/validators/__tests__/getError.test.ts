import { getError } from '../getError'
import type { JSONFormContextValues } from '../../../components'
import { ErrorTypes } from '../../../utils/errorTypes'

const createFormContext = (
  values: Record<string, unknown>
): JSONFormContextValues => {
  return {
    getValues: () => values,
  } as JSONFormContextValues
}

describe('getError', () => {
  test('reports uniqueItems errors from array form values', () => {
    const error = getError(
      undefined,
      {
        type: 'array',
        uniqueItems: true,
      },
      false,
      createFormContext({
        '#/properties/tags': ['react', 'react'],
      }),
      '#/properties/tags'
    )

    expect(error).toEqual({
      message: ErrorTypes.uniqueItems,
      expected: true,
    })
  })

  test('reports multi-select minItems errors from checkbox fields', () => {
    const error = getError(
      undefined,
      {
        type: 'array',
        minItems: 2,
        items: {
          type: 'string',
          enum: ['react', 'typescript'],
        },
      },
      false,
      createFormContext({
        '#/properties/tags[0]': true,
        '#/properties/tags[1]': false,
      }),
      '#/properties/tags'
    )

    expect(error).toEqual({
      message: ErrorTypes.minItems,
      expected: 2,
    })
  })

  test('maps react-hook-form array rule errors to expected schema values', () => {
    const error = getError(
      {
        type: 'validate',
        message: ErrorTypes.maxItems,
      },
      {
        type: 'array',
        maxItems: 3,
      },
      false,
      createFormContext({}),
      '#/properties/tags'
    )

    expect(error).toEqual({
      message: ErrorTypes.maxItems,
      expected: 3,
    })
  })
})
