export function deepFreeze<T extends object>(obj: T): T {
  // Gets all properties names to freeze
  const propNames = Object.getOwnPropertyNames(obj)

  // Freezes each property before freezing the object itself
  propNames.forEach(function (name) {
    const prop = (obj as Record<string, unknown>)[name]

    // Freezes prop if it is an object
    if (typeof prop === 'object' && prop !== null) deepFreeze(prop)
  })

  // Freezes itself
  return Object.freeze(obj)
}
