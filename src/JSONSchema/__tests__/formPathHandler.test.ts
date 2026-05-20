import { getDefaultValuesFromSchema, getObjectFromForm } from '../logic'

test('should return an object that matches the schema', () => {
  const mockJSONSchema = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
      },
      middleName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      address: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
          },
          street: {
            type: 'string',
          },
          streetNumber: {
            type: 'integer',
          },
        },
      },
    },
  }

  const mockData = {
    '#/properties/firstName': 'Jane',
    '#/properties/lastName': 'Doe',
    '#/properties/address/properties/city': 'RJ',
    '#/properties/address/properties/street': 'Praia de Botafogo',
    '#/properties/address/properties/streetNumber': 300,
    '#/properties/middleName': null,
    '#/properties/intruderField':
      'I am an intruder, you should not return me :)',
  }

  const testResult = getObjectFromForm(mockJSONSchema, mockData)

  expect(testResult).toEqual({
    firstName: 'Jane',
    lastName: 'Doe',
    address: {
      city: 'RJ',
      street: 'Praia de Botafogo',
      streetNumber: 300,
    },
  })
})

test('should collect schema defaults as form default values', () => {
  const mockJSONSchema = {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        default: 'Jane',
      },
      age: {
        type: 'integer',
        default: 32,
      },
      address: {
        type: 'object',
        default: {
          city: 'RJ',
        },
        properties: {
          city: {
            type: 'string',
          },
          country: {
            type: 'string',
            default: 'BR',
          },
        },
      },
    },
  }

  expect(getDefaultValuesFromSchema(mockJSONSchema)).toEqual({
    '#/properties/address/properties/city': 'RJ',
    '#/properties/address/properties/country': 'BR',
    '#/properties/age': 32,
    '#/properties/firstName': 'Jane',
  })
})

test('should collect schema const values as form default values', () => {
  const mockJSONSchema = {
    type: 'object',
    properties: {
      role: {
        type: 'string',
        const: 'admin',
      },
      age: {
        type: 'integer',
        const: 32,
      },
      address: {
        type: 'object',
        const: {
          city: 'RJ',
        },
        properties: {
          city: {
            type: 'string',
          },
          country: {
            type: 'string',
            default: 'BR',
          },
        },
      },
      tags: {
        type: 'array',
        const: ['react', 'hooks'],
        items: { type: 'string' },
      },
    },
  }

  expect(getDefaultValuesFromSchema(mockJSONSchema)).toEqual({
    '#/properties/address/properties/city': 'RJ',
    '#/properties/address/properties/country': 'BR',
    '#/properties/age': 32,
    '#/properties/role': 'admin',
    '#/properties/tags': ['react', 'hooks'],
    '#/properties/tags/0': 'react',
    '#/properties/tags/1': 'hooks',
  })
})

test('should prefer schema default over const as form default values', () => {
  const mockJSONSchema = {
    type: 'object',
    properties: {
      role: {
        type: 'string',
        const: 'admin',
        default: 'user',
      },
      profile: {
        type: 'object',
        const: {
          status: 'locked',
        },
        default: {
          status: 'draft',
        },
        properties: {
          status: {
            type: 'string',
          },
        },
      },
    },
  }

  expect(getDefaultValuesFromSchema(mockJSONSchema)).toEqual({
    '#/properties/profile/properties/status': 'draft',
    '#/properties/role': 'user',
  })
})

test('should collect array defaults as indexed form values', () => {
  const mockJSONSchema = {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        default: ['react', 'hooks'],
        items: { type: 'string' },
      },
      contacts: {
        type: 'array',
        default: [{ name: 'Ada' }],
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', default: 'ada@example.com' },
          },
        },
      },
    },
  }

  expect(getDefaultValuesFromSchema(mockJSONSchema)).toEqual({
    '#/properties/contacts': [{ name: 'Ada' }],
    '#/properties/contacts/0/properties/email': 'ada@example.com',
    '#/properties/contacts/0/properties/name': 'Ada',
    '#/properties/tags': ['react', 'hooks'],
    '#/properties/tags/0': 'react',
    '#/properties/tags/1': 'hooks',
  })
})
