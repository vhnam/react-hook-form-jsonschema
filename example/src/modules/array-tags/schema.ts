import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/tags.schema.json',
  title: 'Tags',
  type: 'object',
  required: ['tags'],
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      minItems: 1,
      maxItems: 5,
      items: { type: 'string', minLength: 2 },
    },
  },
} satisfies ObjectJSONSchemaType
