import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'primitives',
  path: '/primitives',
  label: 'Primitives',
  description:
    'useObject — string, formatted string, integer, number, boolean, nested object',
  title: 'Primitives',
  summary:
    'useObject renders primitive string, integer, number, and boolean fields, including pattern, format, and multipleOf validation. Nested object properties are flattened by useObject.',
  schema,
  Form,
}
