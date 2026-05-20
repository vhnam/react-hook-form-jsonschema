import { concatFormPointer } from '../JSONSchema/logic/pathUtils'

const indexPathPattern = /^(\d+)(?:\/(.*))?$/

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeItemPathSegments = (path: string): string[] =>
  path.split('/').filter((segment) => segment !== 'properties')

const createContainerForNextSegment = (nextSegment: string | undefined) =>
  nextSegment !== undefined && /^\d+$/.test(nextSegment) ? [] : {}

const assignItemPathValue = (
  target: Record<string, unknown>,
  path: string,
  value: unknown
): void => {
  const segments = normalizeItemPathSegments(path)
  let current: Record<string, unknown> | unknown[] = target

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1
    const arrayIndex = Number(segment)
    const key = Array.isArray(current) ? arrayIndex : segment

    if (isLast) {
      current[key as keyof typeof current] = value as never

      return
    }

    const nextSegment = segments[index + 1]
    const currentValue = current[key as keyof typeof current]

    if (!isObjectRecord(currentValue) && !Array.isArray(currentValue)) {
      current[key as keyof typeof current] = createContainerForNextSegment(
        nextSegment
      ) as never
    }

    current = current[key as keyof typeof current] as
      | Record<string, unknown>
      | unknown[]
  })
}

export const getArrayItemPointer = (
  arrayPointer: string,
  index: number
): string => {
  return concatFormPointer(arrayPointer, String(index))
}

export const getListArrayItemPointers = (
  values: object,
  pointer: string,
  index: number
): string[] => {
  return getListArrayItemPointersByIndex(values, pointer).get(index) ?? []
}

export const getListArrayItemPointersByIndex = (
  values: object,
  pointer: string
): Map<number, string[]> => {
  const record = values as Record<string, unknown>
  const prefix = `${pointer}/`
  const pointersByIndex = new Map<number, string[]>()

  Object.keys(record).forEach((key) => {
    if (!key.startsWith(prefix)) {
      return
    }

    const match = key.slice(prefix.length).match(indexPathPattern)

    if (!match) {
      return
    }

    const index = Number(match[1])
    const pointers = pointersByIndex.get(index) ?? []

    pointers.push(key)
    pointersByIndex.set(index, pointers)
  })

  return pointersByIndex
}

export const getListArrayEntries = (
  values: object,
  pointer: string
): unknown[] => {
  const record = values as Record<string, unknown>
  const prefix = `${pointer}/`
  const entries = new Map<number, unknown>()

  if (Array.isArray(record[pointer])) {
    record[pointer].forEach((entry, index) => {
      entries.set(index, entry)
    })
  }

  Object.keys(record).forEach((key) => {
    if (!key.startsWith(prefix)) {
      return
    }

    const match = key.slice(prefix.length).match(indexPathPattern)

    if (!match) {
      return
    }

    const index = Number(match[1])
    const pathWithinItem = match[2]
    const existingEntry = entries.get(index)

    if (!pathWithinItem) {
      entries.set(index, record[key])

      return
    }

    const item = isObjectRecord(existingEntry) ? { ...existingEntry } : {}

    assignItemPathValue(item, pathWithinItem, record[key])
    entries.set(index, item)
  })

  return [...entries.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, value]) => value)
}
