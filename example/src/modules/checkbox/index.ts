import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'checkbox',
  path: '/checkbox',
  label: 'Checkbox',
  description: 'useCheckbox — boolean and multi-select array',
  title: 'Checkbox',
  summary:
    'Boolean fields use a single checkbox. Arrays with items.enum render as multi-select checkboxes (uniqueItems supported).',
  schema,
  Form,
}
