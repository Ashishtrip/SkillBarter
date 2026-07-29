# API Response Format Quick Reference

## Standard Format (ALL APIs must follow this)

```typescript
// Success Response
{
  data: <T>,           // The actual data (can be object, array, or null)
  error: null
}

// Error Response
{
  data: null,
  error: "Error message"
}
```

## How to Use in Frontend

### ❌ OLD (Avoid)

```typescript
const response = await fetch("/api/user/profile");
const user = await response.json();
setUser(user); // This breaks if response format changes
```

### ✅ NEW (Recommended)

```typescript
import { apiGet } from "@/lib/fetch-helper";

const { data: user, error } = await apiGet<User>("/api/user/profile");
if (error) {
  console.error(error);
  return;
}
setUser(user); // Always works, type-safe
```

### ✅ ALSO OK (Manual handling)

```typescript
const response = await fetch("/api/user/profile");
const result = await response.json();
const user = result.data || result; // Handles both formats
setUser(user);
```

## Fetch Helper Functions

```typescript
import {
  apiGet,      // GET /path
  apiPost,     // POST /path with body
  apiPut,      // PUT /path with body
  apiPatch,    // PATCH /path with body
  apiDelete,   // DELETE /path
} from '@/lib/fetch-helper';

// Examples
const { data: user } = await apiGet<User>('/api/user/profile');
const { data: exchange } = await apiPost<Exchange>('/api/exchanges', {...});
const { data: updated } = await apiPut<User>('/api/user/profile', {...});
await apiDelete('/api/exchanges/123');
```

## API Endpoint Checklist

All new endpoints must:

- ✅ Import `createApiResponse` and `createApiErrorResponse` from `/lib/api-helpers`
- ✅ Return success as: `return createApiResponse(data, status?)`
- ✅ Return errors as: `return createApiErrorResponse(message, status?)`
- ✅ NEVER use `NextResponse.json(data)` directly
- ✅ Log errors using `logError(error, {...context})`

### ✅ CORRECT API Endpoint

```typescript
import { NextRequest } from "next/server";
import { createApiResponse, createApiErrorResponse } from "@/lib/api-helpers";
import { logError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    // ... fetch data ...
    return createApiResponse(data);
  } catch (error) {
    logError(error, { action: "get_data" });
    return createApiErrorResponse("Failed to fetch data");
  }
}
```

### ❌ INCORRECT (Don't do this)

```typescript
export async function GET(request: NextRequest) {
  try {
    // ... fetch data ...
    return NextResponse.json(data); // ❌ Wrong format
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 }); // ❌ Wrong
  }
}
```

## Response Parsing Rules

When receiving API responses:

1. **If using `apiFetch()` or `apiGet()` etc**: Automatic parsing happens
2. **If manual fetch()**: Extract data like this:
   ```typescript
   const result = await response.json();
   const data = result.data || result; // Works for both formats
   ```

## Common Patterns

### Loading Data

```typescript
const [data, setData] = useState<T | null>(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch Data = async () => {
    const { data, error } = await apiGet<T>('/api/path');
    if (error) {
      setError(error);
    } else {
      setData(data);
    }
    setLoading(false);
  };
  fetchData();
}, []);
```

### Creating Data

```typescript
const handleCreate = async (form: any) => {
  const { data, error } = await apiPost<T>("/api/path", form);
  if (error) {
    alert(error);
    return;
  }
  setData(data);
};
```

### Updating Data

```typescript
const handleUpdate = async (id: string, updates: any) => {
  const { data, error } = await apiPut<T>(`/api/path/${id}`, updates);
  if (error) {
    alert(error);
    return;
  }
  setData(data);
};
```

### Deleting Data

```typescript
const handleDelete = async (id: string) => {
  const { error } = await apiDelete(`/api/path/${id}`);
  if (error) {
    alert(error);
    return;
  }
  // Refresh list or remove from state
};
```

---

**Remember**: Consistency is key! Always follow these patterns.
