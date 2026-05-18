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
