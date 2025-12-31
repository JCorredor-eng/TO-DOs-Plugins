# Generated Documentation

This directory contains auto-generated documentation for the Custom Plugin.

## TypeDoc API Contracts Documentation

The `typedoc/` directory contains interactive HTML documentation for all shared TypeScript contracts (API boundary between frontend and backend).

### Generating TypeDoc Documentation

**Prerequisites:**
- Must be inside the OpenSearch Dashboards container
- Node.js and Yarn must be available
- TypeDoc must be installed (run `yarn install` if needed)

**Inside the container:**

```bash
# Navigate to plugin directory
cd /home/node/kbn/plugins/custom_plugin

# Install TypeDoc if not already installed
yarn install

# Generate documentation
yarn docs:generate

# Or use watch mode for development
yarn docs:watch
```

### Viewing the Documentation

After generation, open the documentation in your browser:

```bash
# The documentation is located at:
docs/generated/typedoc/index.html
```

Since the plugin runs in a Docker container, you'll need to:

1. **Option 1: Copy to host machine**
   ```bash
   # From host machine
   docker cp osd:/home/node/kbn/plugins/custom_plugin/docs/generated/typedoc ./docs/generated/
   ```

2. **Option 2: Access via mounted volume**
   - If `src/` is mounted as a volume, the generated docs should be accessible on your host machine
   - Navigate to `<project-root>/docs/generated/typedoc/index.html`

3. **Option 3: Serve via HTTP**
   ```bash
   # Inside container
   cd /home/node/kbn/plugins/custom_plugin/docs/generated/typedoc
   python3 -m http.server 8080

   # Then open http://localhost:8080 in your browser
   ```

### Documentation Scope

The TypeDoc documentation covers:

- **Core Configuration** (`src/common/constants.ts`)
  - Plugin identity constants
  - API routing paths
  - Pagination defaults
  - Date formatting

- **Domain Types** (`src/common/todo/todo.types.ts`)
  - Core entities (Todo, TodoStats, AnalyticsStats)
  - Enums (TodoStatus, TodoPriority, TodoSeverity)
  - Type aliases (TodoSortField, SortDirection)
  - Index mappings

- **Data Transfer Objects** (`src/common/todo/todo.dtos.ts`)
  - Request payloads (CreateTodoRequest, UpdateTodoRequest, etc.)
  - Response payloads (CreateTodoResponse, ListTodosResponse, etc.)
  - Query parameters (ListTodosQueryParams, TodoStatsQueryParams, etc.)
  - Error responses (ApiErrorResponse)

### Documentation Exclusions

The following are intentionally excluded from TypeDoc output:

- Server-side implementation (`src/server/**`)
- Client-side implementation (`src/public/**`)
- Test files (`**/*.test.ts`, `**/*.spec.ts`)
- Private and internal APIs
- Protected members

Only public API contracts are documented.

### Configuration

TypeDoc is configured via `/typedoc.json` in the project root.

**Key settings:**
- **Entry points**: Only `src/common/` files
- **Output**: `docs/generated/typedoc/`
- **Exclusions**: Private, protected, internal members
- **Theme**: Default HTML theme
- **Categories**: Auto-categorized by module

To modify the configuration, edit `typedoc.json`.

### Manual Documentation

For human-written contract documentation with examples and usage patterns, see:

- **[API Contracts Guide](../contracts.md)**: Comprehensive guide with examples
- **[API Reference](../api.md)**: REST API endpoint documentation
- **[Architecture Guide](../architecture.md)**: System design and patterns

### Updating Documentation

TypeDoc documentation is generated from JSDoc comments in the source code.

**To improve documentation:**

1. Add or enhance JSDoc comments in contract files:
   ```typescript
   /**
    * Represents a TODO item in the system.
    * All properties are readonly to ensure immutability.
    *
    * @example
    * ```typescript
    * const todo: Todo = {
    *   id: '123',
    *   title: 'Example task',
    *   status: 'planned',
    *   // ... other fields
    * };
    * ```
    */
   export interface Todo {
     /** Unique identifier for the TODO item */
     readonly id: string;
     // ...
   }
   ```

2. Regenerate documentation:
   ```bash
   yarn docs:generate
   ```

3. Review changes in browser

### CI/CD Integration

To include TypeDoc generation in your CI/CD pipeline:

```bash
# In your CI script
docker exec osd bash -c "cd /home/node/kbn/plugins/custom_plugin && yarn docs:generate"

# Optionally copy to artifacts directory
docker cp osd:/home/node/kbn/plugins/custom_plugin/docs/generated/typedoc ./artifacts/docs/
```

### Troubleshooting

**Issue: TypeDoc not found**
```bash
# Inside container
cd /home/node/kbn/plugins/custom_plugin
yarn add typedoc --dev
```

**Issue: TypeScript errors during generation**
- Check `src/tsconfig.json` configuration
- Ensure all source files compile without errors
- Review TypeDoc validation warnings

**Issue: Empty documentation**
- Verify entry points in `typedoc.json` are correct
- Check that source files exist and are not excluded
- Ensure JSDoc comments are present

**Issue: Documentation not updating**
- Clear the output directory: `rm -rf docs/generated/typedoc/*`
- Regenerate with `--cleanOutputDir` flag (already enabled in config)

### Additional Resources

- [TypeDoc Official Documentation](https://typedoc.org/)
- [TSDoc Standard](https://tsdoc.org/)
- [JSDoc Documentation](https://jsdoc.app/)

---

Last updated: 2025-01-01
