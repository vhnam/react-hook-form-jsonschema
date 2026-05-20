import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'default',
  path: '/default',
  label: 'Default',
  description: 'schema default — prefilled primitive, object, and checkbox values',
  title: 'Default',
  summary:
    'JSON Schema default values are applied to the form automatically, including nested object defaults and multi-select checkbox defaults.',
  schema,
  Form,
}
