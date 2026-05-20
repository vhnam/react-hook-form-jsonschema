import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'

export const example: ExampleDefinition = {
  id: 'format',
  path: '/format',
  label: 'Format',
  description: 'format — tiered widgets and validation',
  title: 'Format',
  summary:
    'JSON Schema format support is tiered for form builders: email, URI, date, time, and date-time get native widgets; UUID/IP/hostname stay text inputs with validation; API/config formats are validated without special UI.',
  schema,
  Form,
}
