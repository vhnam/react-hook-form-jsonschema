import { concatFormPointer } from '../JSONSchema/logic/pathUtils'

export const getArrayItemPointer = (
  arrayPointer: string,
  index: number
): string => {
  return concatFormPointer(arrayPointer, String(index))
}

export const getListArrayEntries = (
  values: object,
  pointer: string
): unknown[] => {
  const record = values as Record<string, unknown>
  const prefix = `${pointer}/`
  const indices = Object.keys(record)
    .filter((key) => key.startsWith(prefix))
    .map((key) => parseInt(key.slice(prefix.length), 10))
    .filter((index) => !Number.isNaN(index))
    .sort((a, b) => a - b)

  return indices.map((index) => record[getArrayItemPointer(pointer, index)])
}
