import type { ExampleDefinition } from '../../shared/types'

import { Form } from './form'
import { schema } from './schema'
import { uiSchema } from './ui-schema'

export const defaultValues = {
  '#/properties/sessionId': 'demo-session',
}

export const example: ExampleDefinition = {
  id: 'ui-overrides',
  path: '/ui-overrides',
  label: 'UI overrides',
  description: 'useTextArea, usePassword, useHidden',
  title: 'UI overrides',
  summary:
    'Force control types with UITypes: textArea, password, and hidden.',
  schema,
  uiSchema,
  defaultValues,
  Form,
}
