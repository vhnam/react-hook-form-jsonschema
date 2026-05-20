import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'array-tuple',
  path: '/arrays/tuple',
  label: 'Array — tuple',
  description: 'useArray — tuple items (integer, enum string, object)',
  title: 'Array — tuple',
  summary:
    'HTTP response as a fixed tuple: status code, content-type, and body object. All three slots render on load; additionalItems: false prevents extra slots.',
  schema,
  Form,
}
