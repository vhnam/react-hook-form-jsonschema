import type { JSONValue } from '../../JSONSchema'

import { ErrorTypes } from '../errorTypes'

export type ErrorMessageValues = JSONValue | undefined

export type ErrorMessage =
  | {
      message: ErrorTypes | string
      expected: ErrorMessageValues
    }
  | undefined
