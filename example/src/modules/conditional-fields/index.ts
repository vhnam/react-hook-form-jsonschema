import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'conditional-fields',
  path: '/conditional-fields',
  label: 'Conditional — 2020-12',
  description: 'JSON Schema 2020-12 if/then/else and allOf visibility',
  title: 'Conditional fields — 2020-12',
  summary:
    'Use JSON Schema 2020-12 conditionals with x-hidden overlays to show fields and make them required only when trigger values match.',
  schema,
  Form,
}
