import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/primitives.schema.json',
  title: 'Primitives',
  type: 'object',
  required: ['firstName'],
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      minLength: 1,
    },
    username: {
      type: 'string',
      title: 'Username',
      pattern: '^[a-z][a-z0-9_]{2,15}$',
      description:
        'Lowercase letter, then 2–15 letters, digits, or underscores.',
    },
    age: {
      type: 'integer',
      title: 'Age',
      minimum: 0,
      maximum: 120,
    },
    score: {
      type: 'number',
      title: 'Score',
      minimum: 0,
      maximum: 100,
      multipleOf: 0.5,
    },
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string', title: 'Street' },
        city: { type: 'string', title: 'City' },
      },
    },
  },
} satisfies ObjectJSONSchemaType
