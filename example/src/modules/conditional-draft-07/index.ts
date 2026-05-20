import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'conditional-draft-07',
  path: '/conditional-fields/draft-07',
  label: 'Conditional — Draft-07',
  description: 'Draft-07 dependencies and if/then/else',
  title: 'Conditional fields — Draft-07',
  summary:
    'Draft-07 uses dependencies for presence-based required fields and if/then/else for value-based conditional UI.',
  schema,
  Form,
}
