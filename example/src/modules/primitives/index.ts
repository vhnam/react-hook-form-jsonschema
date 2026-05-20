import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'primitives',
  path: '/primitives',
  label: 'Primitives',
  description: 'useInput — string, integer, number, pattern, nested object',
  title: 'Primitives',
  summary:
    'useInput for string, integer, and number types, including pattern and multipleOf. Nested object properties are flattened by useObject.',
  schema,
  Form,
}
