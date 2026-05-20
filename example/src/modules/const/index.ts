import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'const',
  path: '/const',
  label: 'Const',
  description: 'const — fixed values with exact-match validation',
  title: 'Const',
  summary:
    'JSON Schema const pre-fills fields when no default is provided and validates that submitted values exactly match the fixed value.',
  schema,
  Form,
}
