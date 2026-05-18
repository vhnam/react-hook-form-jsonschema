import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/coords.schema.json',
  title: 'Coordinates',
  type: 'object',
  properties: {
    coords: {
      type: 'array',
      title: 'Coordinates (tuple)',
      items: [
        { type: 'integer', title: 'Latitude', minimum: -90, maximum: 90 },
        { type: 'integer', title: 'Longitude', minimum: -180, maximum: 180 },
      ],
    },
  },
} satisfies ObjectJSONSchemaType
