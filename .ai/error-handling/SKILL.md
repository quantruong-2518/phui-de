---
name: Error Handling
description: Standard error handling patterns for API routes, client components, and data fetching.
---

# Error Handling Patterns

## 1. API Routes

Standard pattern for `app/api/...`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // logic
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API_NAME] Error:', error);
    return NextResponse.json(
      { error: 'User-friendly error message' },
      { status: 500 },
    );
  }
}
```

## 2. Client Components (Mutations)

Usage with toast notifications:

```typescript
try {
  await mutation();
  toast.success('Action successful');
} catch (error) {
  console.error('Mutation error:', error);
  toast.error('Something went wrong. Please try again.');
}
```

## 3. Data Fetching (SWR)

Handling loading and error states:

```typescript
const { data, error, isLoading } = useSWR('/api/endpoint', fetcher)

if (error) {
  return <div className="text-destructive">Failed to load data</div>
}

if (isLoading) {
  return <div className="text-muted-foreground">Loading...</div>
}
```

## 4. Error Boundary

Global or section-level error handling:

```typescript
// components/shared/ErrorBoundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Sorry.. there was an error</h1>
    }

    return this.props.children
  }
}
```

## Guidelines

1. **Always log errors** to console (server or client) for debugging.
2. **User-friendly messages** in UI/Toasts, not raw error objects.
3. **HTTP Status Codes**: Use 400, 401, 403, 404, 500 appropriately.
4. **Never swallow errors** silently unless explicitly intended.

## When to use

- Design API error responses
- Handle client-side errors
- Setup error boundaries
