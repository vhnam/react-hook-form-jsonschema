import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/enums.schema.json',
  title: 'Enums',
  type: 'object',
  properties: {
    role: {
      type: 'string',
      title: 'Role',
      enum: ['admin', 'user', 'guest'],
    },
    priority: {
      type: 'string',
      title: 'Priority',
      enum: ['low', 'medium', 'high'],
    },
    birthYear: {
      type: 'integer',
      title: 'Birth Year',
      minimum: 1990,
      maximum: 2010,
    },
  },
} satisfies ObjectJSONSchemaType
