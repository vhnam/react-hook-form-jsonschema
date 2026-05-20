import type { ObjectJSONSchemaType } from 'react-hook-form-jsonschema'

export const schema = {
  $schema: 'https://json-schema.org/draft/2019-09/schema',
  $id: 'https://example.com/conditional-2019-09.schema.json',
  title: 'Conditional fields — 2019-09',
  type: 'object',
  required: ['planType', 'contactPreference'],
  additionalProperties: false,
  properties: {
    planType: {
      type: 'string',
      title: 'Plan type',
      description:
        'The enterprise option applies a dependent schema that reveals company details.',
      enum: ['personal', 'enterprise'],
    },
    companyName: {
      type: 'string',
      title: 'Company name',
      'x-hidden': true,
    },
    companySize: {
      type: 'integer',
      title: 'Company size',
      minimum: 1,
      maximum: 100000,
      'x-hidden': true,
    },
    paymentMethod: {
      type: 'string',
      title: 'Payment method',
      description:
        'dependentRequired replaces the Draft-07 array form of dependencies.',
      enum: ['bank_transfer', 'credit_card'],
    },
    billingAddress: {
      type: 'string',
      title: 'Billing address',
    },
    billingCity: {
      type: 'string',
      title: 'Billing city',
    },
    contactPreference: {
      type: 'string',
      title: 'Contact preference',
      enum: ['phone', 'email'],
    },
    contactEmail: {
      type: 'string',
      title: 'Contact email',
      format: 'email',
      'x-hidden': true,
    },
  },
  dependentRequired: {
    paymentMethod: ['billingAddress', 'billingCity'],
  },
  dependentSchemas: {
    planType: {
      if: {
        properties: {
          planType: { const: 'enterprise' },
        },
        required: ['planType'],
      },
      then: {
        properties: {
          companyName: { 'x-hidden': false },
          companySize: { 'x-hidden': false },
        },
        required: ['companyName', 'companySize'],
      },
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
