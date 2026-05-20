import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'conditional-2019-09',
  path: '/conditional-fields/2019-09',
  label: 'Conditional — 2019-09',
  description: '2019-09 dependentRequired and dependentSchemas',
  title: 'Conditional fields — 2019-09',
  summary:
    'Draft 2019-09 splits dependencies into dependentRequired and dependentSchemas, while still composing with if/then conditionals.',
  schema,
  Form,
}
