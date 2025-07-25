# Generic Storage Services

This module provides reusable storage patterns for building hybrid storage services that can work with any data type. The services are designed to be framework-agnostic and can be easily extracted to a separate package.

## Features

- **Generic Storage Interface**: Type-safe storage operations for any data model
- **Hybrid Storage**: Automatic fallback from API to localStorage
- **Configurable Behavior**: Customizable retry logic, timeouts, and transformations
- **Type Safety**: Full TypeScript support with generic types
- **Framework Agnostic**: Works with React, Vue, Svelte, and any JavaScript framework

## File Structure

The generic storage services are organized following the existing folder structure:

```
frontend/lib/storage/
├── generic/
│   ├── storage.ts           # Common interfaces and types
│   ├── local-storage.ts     # Generic localStorage service
│   ├── api-storage.ts       # Generic API storage service
│   ├── hybrid-storage.ts    # Generic hybrid storage service
│   ├── utils.ts             # Storage utilities
│   ├── README.md            # Documentation
│   └── index.ts             # Generic exports
├── sparktest-storage.ts     # SparkTest-specific implementation
├── README.md                # Main documentation
└── index.ts                 # Main exports
```

## Storage Services

### GenericLocalStorageService<T>

A generic localStorage-based storage service that works with any data type.

```typescript
import { GenericLocalStorageService, storageUtils } from "./generic"

interface User {
  id: string
  name: string
  email: string
}

const userStorage = new GenericLocalStorageService<User>(
  "app_users",
  [], // default items
  (user) => user.id, // ID extractor
  storageUtils,
  {
    insertMode: "unshift", // 'push' or 'unshift'
    maxItems: 100, // optional limit
  }
)

// Usage
const users = await userStorage.getItems()
const newUser = await userStorage.saveItem({ id: "1", name: "John", email: "john@example.com" })
const user = await userStorage.getItemById("1")
await userStorage.deleteItem("1")
```

### GenericApiStorageService<T>

A generic API-based storage service with request/response transformation support.

```typescript
import { GenericApiStorageService } from "./generic"

const userApiStorage = new GenericApiStorageService<User>(
  "users",
  "http://localhost:3000/api",
  (user) => user.id,
  {
    transformRequest: (user) => ({
      ...user,
      created_at: user.createdAt,
      createdAt: undefined,
    }),
    transformResponse: (data) =>
      data.map((user) => ({
        ...user,
        createdAt: user.created_at,
        created_at: undefined,
      })),
  }
)

// Usage
const users = await userApiStorage.getItems()
const newUser = await userApiStorage.saveItem(user)
```

### GenericHybridStorageService<T>

A generic hybrid storage service that tries API first and falls back to localStorage.

```typescript
import { GenericHybridStorageService } from "./generic"

const hybridStorage = new GenericHybridStorageService<User>(userApiStorage, userLocalStorage, {
  onFallback: (reason) => console.log("Fallback triggered:", reason),
  onError: (error, context) => console.error("Storage error:", error, context),
})

// Usage - automatically handles fallback
const users = await hybridStorage.getItems()
const newUser = await hybridStorage.saveItem(user)
```

## Real-time Updates

All storage services support real-time updates through subscriptions:

```typescript
const unsubscribe = storage.subscribe((event) => {
  switch (event.eventType) {
    case "INSERT":
      console.log("New item:", event.new)
      break
    case "UPDATE":
      console.log("Updated item:", event.new)
      break
    case "DELETE":
      console.log("Deleted item:", event.old)
      break
  }
})

// Cleanup
unsubscribe()
```

## Storage Configuration

```typescript
interface StorageConfig {
  // API Configuration
  apiBaseUrl?: string
  apiTimeout?: number
  maxRetries?: number

  // LocalStorage Configuration
  storagePrefix?: string
  maxStorageSize?: number

  // Fallback Behavior
  fallbackTimeout?: number
  offlineThreshold?: number

  // Data Transformation
  transformRequest?: (data: any) => any
  transformResponse?: (data: any) => any

  // Error Handling
  onError?: (error: Error, context: string) => void
  onFallback?: (reason: string) => void
}
```

## Usage in SparkTest

The SparkTest application uses these generic storage services through the `SparkTestStorageService` class, which provides SparkTest-specific business logic while leveraging the generic storage infrastructure.

```typescript
import { SparkTestStorageService } from "./sparktest-storage"

const storage = new SparkTestStorageService()

// SparkTest-specific operations
const executors = await storage.getExecutors()
const definitions = await storage.getDefinitions()
const runs = await storage.getRuns()
const testSuites = await storage.getTestSuites()
```

## Future Extraction

These generic storage services are designed to be easily extracted to a separate npm package. The following files would be included in the extracted package:

- `generic/storage.ts` - Common interfaces and types
- `generic/local-storage.ts` - Generic localStorage service
- `generic/api-storage.ts` - Generic API storage service
- `generic/hybrid-storage.ts` - Generic hybrid storage service
- `generic/utils.ts` - Storage utilities
- `generic/index.ts` - Exports
- `generic/README.md` - Documentation
- Tests and documentation

The extracted package would be framework-agnostic and could be used by any JavaScript application that needs hybrid storage capabilities.

## Benefits

1. **Reusability**: Can be used with any data model
2. **Type Safety**: Full TypeScript support
3. **Flexibility**: Configurable behavior and transformations
4. **Reliability**: Automatic fallback handling
5. **Framework Agnostic**: Works with any JavaScript framework
6. **Modular**: Each storage type is in its own file for better organization
7. **Battle Tested**: Used in production by SparkTest

## Example Use Cases

- **Offline-first applications**: Apps that work without internet
- **Progressive Web Apps**: PWAs with offline capabilities
- **Developer tools**: IDEs, dashboards, admin interfaces
- **Data-intensive apps**: Analytics, monitoring, logging tools
- **Mobile-friendly apps**: Handle poor connectivity gracefully
