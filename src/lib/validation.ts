/**
 * Validates if a string is a valid MongoDB ObjectId (24 hex chars)
 * Avoid importing mongoose here to keep this utility lightweight and
 * test-friendly (no heavy ESM node_modules imported during tests).
 * @param id - The string to validate
 * @returns true if valid ObjectId, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // MongoDB ObjectId is a 24-character hexadecimal string
  return /^[a-fA-F0-9]{24}$/.test(id);
}

/**
 * Validates multiple ObjectIds at once
 * @param ids - Array of strings to validate
 * @returns true if all are valid, false otherwise
 */
export function areValidObjectIds(ids: (string | undefined | null)[]): boolean {
  return ids.every(id => id && isValidObjectId(id));
}

