import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/http-response.schema.json',
  title: 'HTTP response',
  type: 'object',
  properties: {
    response: {
      type: 'array',
      title: 'HTTP Response',
      additionalItems: false,
      items: [
        {
          type: 'integer',
          title: 'Status code',
          minimum: 100,
          maximum: 599,
        },
        {
          type: 'string',
          title: 'Content-Type',
          enum: ['application/json', 'text/html', 'text/plain'],
        },
        {
          type: 'object',
          title: 'Body',
          properties: {
            data: { type: 'string', title: 'Data' },
            error: { type: 'string', title: 'Error' },
          },
        },
      ],
    },
  },
} satisfies ObjectJSONSchemaType
