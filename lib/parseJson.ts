/**
 * Safe JSON parsing for request bodies.
 */

/**
 * Parses a string as JSON. Returns null if invalid.
 */
export function parseJson<T>(raw: string | null | undefined): T | null {
  if (raw == null || raw === '') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
