import { getEnumAsStringArray } from '../enumUtils'

test('should return an empty array when schema has no enum', () => {
  expect(getEnumAsStringArray({ type: 'string' })).toEqual([])
})

test('should preserve falsy enum values as distinct strings', () => {
  expect(
    getEnumAsStringArray({
      type: 'string',
      enum: [0, false, null, ''],
    })
  ).toEqual(['0', 'false', 'null', ''])
})
