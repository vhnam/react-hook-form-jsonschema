import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

import { SCHEMA_BASE } from '../../shared/schema-base'

export const schema = {
  ...SCHEMA_BASE,
  $id: 'https://example.com/primitives.schema.json',
  title: 'Primitives',
  type: 'object',
  required: ['firstName', 'username', 'email', 'age', 'score'],
  additionalProperties: false,
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      description: 'Required string input with a minimum length.',
      minLength: 1,
      maxLength: 80,
    },
    username: {
      type: 'string',
      title: 'Username',
      pattern: '^[a-z][a-z0-9_]{2,15}$',
      description:
        'Lowercase letter, then 2 to 15 letters, digits, or underscores.',
    },
    email: {
      type: 'string',
      title: 'Email',
      description: 'Formatted string rendered as an email input.',
      format: 'email',
    },
    age: {
      type: 'integer',
      title: 'Age',
      description: 'Integer input constrained to a realistic age range.',
      minimum: 0,
      maximum: 120,
    },
    score: {
      type: 'number',
      title: 'Score',
      description: 'Number input that must be a half-point increment.',
      minimum: 0,
      maximum: 100,
      multipleOf: 0.5,
    },
    newsletter: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
      description: 'Boolean primitive rendered with the default checkbox UI.',
    },
    address: {
      type: 'object',
      title: 'Address',
      additionalProperties: false,
      properties: {
        street: { type: 'string', title: 'Street' },
        city: { type: 'string', title: 'City' },
      },
    },
  },
} satisfies ObjectJSONSchemaType
