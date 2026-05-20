import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'array-tags',
  path: '/arrays/tags',
  label: 'Array — tags',
  description: 'useArray — string list with minItems / maxItems',
  title: 'Array — tags',
  summary:
    'useArray for an open-ended string list. minItems and maxItems control add/remove.',
  schema,
  Form,
}
