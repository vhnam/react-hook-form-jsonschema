import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/ui-overrides.schema.json',
  title: 'UI overrides',
  type: 'object',
  properties: {
    bio: {
      type: 'string',
      title: 'Bio',
      maxLength: 500,
    },
    password: {
      type: 'string',
      title: 'Password',
      minLength: 8,
    },
    sessionId: {
      type: 'string',
      title: 'Session ID',
    },
  },
} satisfies ObjectJSONSchemaType
