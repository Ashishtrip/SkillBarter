/**
 * Unified fetch helper to handle API responses consistently
 * All API responses follow the format: { data: T, error: null | string }
 */

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
}

/**
 * Parse API response and extract data
 * Handles both new format { data, error } and fallback for raw objects
 */
export function parseApiResponse<T>(response: any): T {
  if (!response) {
    return null as any;
  }

  // If response has 'data' property, extract it (new standardized format)
  if ('data' in response && 'error' in response) {
    return response.data as T;
  }

  // If response is an array, return as is
  if (Array.isArray(response)) {
    return response as any;
  }

  // Otherwise, return the response as is (for backward compatibility)
  return response as T;
}

/**
 * Fetch data from API with automatic response parsing
 */
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const response = await fetch(url, options);
    const status = response.status;

    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: null,
        error: errorData.error || `HTTP Error: ${status}`,
        status,
      };
    }

    const responseData = await response.json();
    const data = parseApiResponse<T>(responseData);

    return {
      data,
      error: null,
      status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    };
  }
}

/**
 * Type-safe fetch for GET requests
 */
export async function apiGet<T = any>(url: string) {
  return apiFetch<T>(url, { method: 'GET' });
}

/**
 * Type-safe fetch for POST requests
 */
export async function apiPost<T = any>(
  url: string,
  body: any,
  options?: Omit<RequestInit, 'method' | 'body'>
) {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Type-safe fetch for PUT requests
 */
export async function apiPut<T = any>(
  url: string,
  body: any,
  options?: Omit<RequestInit, 'method' | 'body'>
) {
  return apiFetch<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Type-safe fetch for PATCH requests
 */
export async function apiPatch<T = any>(
  url: string,
  body: any,
  options?: Omit<RequestInit, 'method' | 'body'>
) {
  return apiFetch<T>(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Type-safe fetch for DELETE requests
 */
export async function apiDelete<T = any>(url: string) {
  return apiFetch<T>(url, { method: 'DELETE' });
}
