import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/checkbox.schema.json',
  title: 'Checkbox',
  type: 'object',
  properties: {
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
    },
    hobbies: {
      type: 'array',
      title: 'Hobbies',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: ['reading', 'gaming', 'cooking', 'sports'],
      },
    },
  },
} satisfies ObjectJSONSchemaType
