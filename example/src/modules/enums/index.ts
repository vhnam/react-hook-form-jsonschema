import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'
import { uiSchema } from './ui-schema'

export const example: ExampleDefinition = {
  id: 'enums',
  path: '/enums',
  label: 'Enums',
  description: 'useSelect, useRadio — enum and integer range via UI schema',
  title: 'Enums',
  summary:
    'String enum defaults to useSelect. Priority uses UITypes.radio; birth year uses UITypes.select for an integer range.',
  schema,
  uiSchema,
  Form,
}
