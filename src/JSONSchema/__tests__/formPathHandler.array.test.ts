import { getObjectFromForm } from '../logic'

test('should build array values from indexed pointers', () => {
  const schema = {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  }

  const formData = {
    '#/properties/tags/0': 'react',
    '#/properties/tags/1': 'hooks',
  }

  expect(getObjectFromForm(schema, formData)).toEqual({
    tags: ['react', 'hooks'],
  })
})

test('should accept a whole array value at the array pointer', () => {
  const schema = {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  }

  const formData = {
    '#/properties/tags': ['a', 'b'],
  }

  expect(getObjectFromForm(schema, formData)).toEqual({
    tags: ['a', 'b'],
  })
})

test('should build object array items from nested indexed pointers', () => {
  const schema = {
    type: 'object',
    properties: {
      contacts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  }

  const formData = {
    '#/properties/contacts/0': {},
    '#/properties/contacts/0/properties/name': 'Ada',
    '#/properties/contacts/0/properties/email': 'ada@example.com',
    '#/properties/contacts/1': {},
    '#/properties/contacts/1/properties/name': 'Grace',
  }

  expect(getObjectFromForm(schema, formData)).toEqual({
    contacts: [
      { name: 'Ada', email: 'ada@example.com' },
      { name: 'Grace' },
    ],
  })
})
