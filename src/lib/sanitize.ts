import DOMPurify from 'isomorphic-dompurify';

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags and sanitize
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Trim whitespace and limit length
  return sanitized.trim().substring(0, 1000);
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    // Non-string input should be considered invalid for emails
    throw new Error('Invalid email format');
  }
  
  // Basic email validation and sanitization
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  // Work with a loose any type internally to allow mutating values of unknown shape
  const sanitized: any = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized as T;
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (typeof password !== 'string') {
    return { isValid: false, error: 'Password must be a string' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters' };
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Password is too common' };
  }
  
  return { isValid: true };
}

export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }
  
  // Remove special characters that could be used for injection
  const sanitized = query
    .replace(/[<>\"'%;()&+]/g, '')
    .trim()
    .substring(0, 100);
  
  return sanitized;
}
