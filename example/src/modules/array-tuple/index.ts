import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'array-tuple',
  path: '/arrays/tuple',
  label: 'Array — tuple',
  description: 'useArray — tuple items schema per index',
  title: 'Array — tuple',
  summary:
    'When items is an array of schemas, getItemSchema(index) resolves the schema for each slot.',
  schema,
  Form,
}
