import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'array-contacts',
  path: '/arrays/contacts',
  label: 'Array — contacts',
  description: 'useArray — array of objects',
  title: 'Array — contacts',
  summary:
    'useArray with object items. Each row renders nested fields via useObject on getItemPointer(index).',
  schema,
  Form,
}
