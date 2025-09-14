const names = "Lily and Jan and wouter"
export const getNames = () => names
export const getFirstChar = () => {
  return names.charAt(0)
}

/**
 * Returns the names
 */
export function getNamesTyped<TNames extends string>(): TNames {
  return names as TNames
}