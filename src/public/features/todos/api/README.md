# TODO API Client

This directory contains the HTTP client for the TODO Management API.

## Architecture

### Files

- **`todos.client.ts`** - Main HTTP client class with type-safe API methods
- **`query-params.builder.ts`** - Query parameter builder utilities
- **`__tests__/query-params.builder.test.ts`** - Unit tests for the builder

## Query Parameter Builder

The `QueryParamsBuilder` provides a clean, fluent interface for building HTTP query parameters with automatic validation and type conversion.

### Benefits

1. **DRY (Don't Repeat Yourself)**: Eliminates repetitive `if` checks for undefined values
2. **Type Safety**: Ensures correct parameter types (string, number, boolean, arrays)
3. **Readability**: Clear, declarative syntax using method chaining
4. **Maintainability**: Centralized logic for parameter handling
5. **Testability**: Fully unit tested with 100% coverage
6. **Consistency**: Uniform handling of edge cases (undefined, null, empty strings)

### Usage Examples

#### Before Refactoring (Verbose)

```typescript
async list(params?: ListTodosQueryParams): Promise<ListTodosResponse> {
  const queryParams: Record<string, string | number | boolean> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.searchText) queryParams.searchText = params.searchText;
  if (params?.status) {
    queryParams.status = Array.isArray(params.status)
      ? params.status.join(',')
      : params.status;
  }
  if (params?.tags && params.tags.length > 0) {
    queryParams.tags = params.tags.join(',');
  }
  if (params?.isOverdue !== undefined) {
    queryParams.isOverdue = params.isOverdue.toString();
  }

  return this.http.get<ListTodosResponse>(this.basePath, { query: queryParams });
}
```

#### After Refactoring (Clean)

```typescript
async list(params?: ListTodosQueryParams): Promise<ListTodosResponse> {
  const query = buildQueryParams((builder) => {
    builder
      .addIfDefined('page', params?.page)
      .addIfDefined('pageSize', params?.pageSize)
      .addIfDefined('searchText', params?.searchText)
      .addArrayOrString('status', params?.status)
      .addArray('tags', params?.tags)
      .addBoolean('isOverdue', params?.isOverdue);
  });

  return this.http.get<ListTodosResponse>(this.basePath, { query });
}
```

### Builder Methods

#### `addIfDefined(key, value)`
Adds a primitive parameter (string or number) if it's defined and not empty.

```typescript
builder.addIfDefined('page', 1);           // ✅ { page: 1 }
builder.addIfDefined('page', undefined);   // ✅ {}
builder.addIfDefined('page', null);        // ✅ {}
builder.addIfDefined('page', '');          // ✅ {}
builder.addIfDefined('count', 0);          // ✅ { count: 0 } - zero is valid
```

#### `addArray(key, value)`
Adds an array as a comma-separated string if it has items.

```typescript
builder.addArray('tags', ['urgent', 'security']);  // ✅ { tags: 'urgent,security' }
builder.addArray('tags', []);                      // ✅ {}
builder.addArray('tags', undefined);               // ✅ {}
```

#### `addArrayOrString(key, value)`
Adds either an array (joined) or a single string value.

```typescript
builder.addArrayOrString('status', ['planned', 'done']);  // ✅ { status: 'planned,done' }
builder.addArrayOrString('status', 'planned');            // ✅ { status: 'planned' }
builder.addArrayOrString('status', undefined);            // ✅ {}
```

#### `addBoolean(key, value)`
Adds a boolean as a string representation.

```typescript
builder.addBoolean('isOverdue', true);      // ✅ { isOverdue: 'true' }
builder.addBoolean('isOverdue', false);     // ✅ { isOverdue: 'false' }
builder.addBoolean('isOverdue', undefined); // ✅ {}
```

### Fluent Interface

All methods return `this`, enabling method chaining:

```typescript
const query = buildQueryParams((builder) => {
  builder
    .addIfDefined('page', 1)
    .addIfDefined('pageSize', 20)
    .addArray('tags', ['security'])
    .addBoolean('isOverdue', true);
});

// Result: { page: 1, pageSize: 20, tags: 'security', isOverdue: 'true' }
```

## Testing

Run the query builder tests:

```bash
# Inside the osd container
cd /home/node/kbn/plugins/custom_plugin
yarn test public/features/todos/api/__tests__/query-params.builder.test.ts
```

The test suite includes:
- 40+ test cases covering all builder methods
- Edge case handling (undefined, null, empty arrays)
- Real-world scenarios (list params, stats params, analytics params)
- Fluent interface chaining
- Type safety verification

## Best Practices

1. **Always use the builder** for constructing query parameters - don't manually build objects
2. **Chain methods** for readability - one parameter per line
3. **Use appropriate methods**:
   - `addIfDefined` for simple values (page, pageSize, searchText)
   - `addArray` for arrays that should always be joined (tags, complianceFrameworks)
   - `addArrayOrString` for values that can be either (status, priority, severity)
   - `addBoolean` for boolean flags (isOverdue, overdueOnly)
4. **Don't check for undefined** - the builder handles it automatically
5. **Maintain consistency** - follow the existing patterns in `todos.client.ts`

## Future Enhancements

Potential improvements to consider:

- **Date formatting**: Add `addDate()` method for ISO date string conversion
- **Number ranges**: Add `addRange()` for min/max parameters
- **Enum validation**: Add `addEnum()` with allowed values checking
- **URL encoding**: Automatic encoding of special characters
- **Custom serializers**: Support for complex object serialization
