import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

export const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://example.com/conditional-fields.schema.json',
  title: 'Conditional fields',
  type: 'object',
  required: ['employmentStatus', 'contactPreference'],
  additionalProperties: false,
  properties: {
    employmentStatus: {
      type: 'string',
      title: 'Employment status',
      description:
        'Choose employed or self-employed to reveal the matching business field.',
      enum: ['employed', 'self_employed', 'unemployed'],
    },
    companyName: {
      type: 'string',
      title: 'Company name',
      description: 'Required only when employment status is employed.',
      'x-hidden': true,
    },
    abnNumber: {
      type: 'string',
      title: 'ABN number',
      description: 'Required only when employment status is self-employed.',
      pattern: '^\\d{11}$',
      'x-hidden': true,
    },
    contactPreference: {
      type: 'string',
      title: 'Contact preference',
      description: 'Choosing email reveals and requires an email address.',
      enum: ['phone', 'email'],
    },
    contactEmail: {
      type: 'string',
      title: 'Contact email',
      format: 'email',
      'x-hidden': true,
    },
    contactPhone: {
      type: 'string',
      title: 'Contact phone',
      description: 'Phone stays visible to show that independent conditions compose.',
    },
  },
  if: {
    properties: {
      employmentStatus: { const: 'employed' },
    },
    required: ['employmentStatus'],
  },
  then: {
    properties: {
      companyName: { 'x-hidden': false },
    },
    required: ['companyName'],
  },
  else: {
    if: {
      properties: {
        employmentStatus: { const: 'self_employed' },
      },
      required: ['employmentStatus'],
    },
    then: {
      properties: {
        abnNumber: { 'x-hidden': false },
      },
      required: ['abnNumber'],
    },
  },
  allOf: [
    {
      if: {
        properties: {
          contactPreference: { const: 'email' },
        },
        required: ['contactPreference'],
      },
      then: {
        properties: {
          contactEmail: { 'x-hidden': false },
        },
        required: ['contactEmail'],
      },
    },
  ],
} satisfies ObjectJSONSchemaType
