# Custom Plugin Documentation

Comprehensive documentation for the OpenSearch Dashboards Custom Plugin (TODO Management System).

## Documentation Index

### Core Documentation

1. **[Architecture Guide](./architecture.md)** (1,026 lines)
   - System architecture and design patterns
   - 5-layer backend architecture (Routes → Controllers → Services → Repositories → Mappers)
   - Feature-first frontend organization
   - Data flow and component interaction
   - Design decisions and technical challenges

2. **[API Contracts](./contracts.md)** (800+ lines)
   - Complete TypeScript contract documentation
   - Shared types and DTOs between frontend and backend
   - Validation rules and constraints
   - Usage examples and best practices
   - Field descriptions and type definitions

3. **[API Reference](./api.md)** (716 lines)
   - Complete REST API documentation
   - All 6 endpoints with request/response examples
   - Query parameters and filters
   - Error responses and status codes
   - cURL examples for testing

4. **[Features Documentation](./features.md)** (764 lines)
   - Complete feature catalog
   - User workflows and use cases
   - CRUD operations
   - Search, filtering, and sorting
   - Analytics and visualizations

### Specialized Documentation

5. **[Dashboard & UI Guide](./dashboards.md)** (44KB)
   - Frontend component documentation
   - Chart configurations and visualizations
   - UI patterns and custom hooks
   - EUI component usage

6. **[Testing Guide](./testing.md)** (1,016 lines)
   - How to run tests in Docker container
   - Test suite organization (169 tests)
   - Coverage reports and debugging
   - CI/CD integration

7. **[User Guide](./user-guide.md)**
   - End-user documentation
   - Feature walkthroughs
   - Screenshots and tutorials

### Generated Documentation

8. **[TypeDoc API Contracts](./generated/typedoc/)** (Auto-generated)
   - Interactive HTML documentation
   - Generated from JSDoc comments
   - Full type hierarchies and cross-references
   - **Requires generation** - see [Generation Instructions](./generated/README.md)

## Quick Navigation

### By Role

**Backend Developer:**
- Start with [Architecture Guide](./architecture.md)
- Review [API Contracts](./contracts.md)
- Reference [API Reference](./api.md)

**Frontend Developer:**
- Start with [Dashboard & UI Guide](./dashboards.md)
- Review [API Contracts](./contracts.md)
- Reference [Features Documentation](./features.md)

**QA Engineer:**
- Start with [Testing Guide](./testing.md)
- Reference [Features Documentation](./features.md)
- Use [API Reference](./api.md) for testing

**Product Manager:**
- Start with [Features Documentation](./features.md)
- Review [User Guide](./user-guide.md)

**New Developer (Onboarding):**
1. Read [Architecture Guide](./architecture.md) - Understand the system
2. Review [API Contracts](./contracts.md) - Learn the API boundary
3. Run tests following [Testing Guide](./testing.md) - Verify setup
4. Explore [Features Documentation](./features.md) - Understand capabilities

### By Task

**Adding a new feature:**
1. Define contracts in `src/common/` (see [API Contracts](./contracts.md))
2. Follow 5-layer architecture (see [Architecture Guide](./architecture.md))
3. Write tests (see [Testing Guide](./testing.md))
4. Update documentation

**Fixing a bug:**
1. Write a failing test (see [Testing Guide](./testing.md))
2. Fix the bug following architecture patterns
3. Verify all tests pass
4. Update docs if behavior changed

**Adding an API endpoint:**
1. Define DTOs in `src/common/todo/todo.dtos.ts`
2. Add route → controller → service → repository layers
3. Document in [API Reference](./api.md)
4. Add tests for all layers

**Working with the UI:**
1. Review [Dashboard & UI Guide](./dashboards.md)
2. Check [API Contracts](./contracts.md) for data shapes
3. Follow presentational component pattern
4. Use custom hooks for business logic

## Contract Documentation

The plugin's API contracts (shared types and DTOs) are documented in two formats:

### 1. Manual Documentation
**Location:** [docs/contracts.md](./contracts.md)

Human-written documentation with:
- Detailed field descriptions
- Validation rules and constraints
- Usage examples and patterns
- Business rules and workflows
- Complete reference for all shared contracts

**When to use:** Primary reference for developers, includes context and examples

### 2. TypeDoc Generated Documentation
**Location:** [docs/generated/typedoc/](./generated/typedoc/)

Auto-generated from source code JSDoc comments with:
- Interactive HTML interface
- Full type hierarchies
- Cross-references and inheritance diagrams
- Source code links
- Searchable index

**When to use:** Quick type lookups, exploring type relationships, viewing source

### Generating TypeDoc Documentation

TypeDoc documentation must be generated inside the Docker container:

```bash
# 1. Attach to container (VS Code or docker exec)
docker exec -it osd bash

# 2. Navigate to plugin
cd /home/node/kbn/plugins/custom_plugin

# 3. Install dependencies (if needed)
yarn install

# 4. Generate documentation
yarn docs:generate

# 5. View at docs/generated/typedoc/index.html
```

See [docs/generated/README.md](./generated/README.md) for detailed instructions.

## Documentation Standards

### Language
All documentation must be written in **professional technical English**. This includes:
- Code comments
- API documentation
- Architecture diagrams
- Commit messages
- Test descriptions

### Format
- Use Markdown for all documentation files
- Include code examples with syntax highlighting
- Add table of contents for documents >500 lines
- Use relative links for cross-references
- Include last-updated timestamps

### Maintenance
- Update documentation when code changes
- Keep examples up-to-date and tested
- Review docs during code review
- Document breaking changes prominently

### Code Comments
- Use JSDoc format for TypeScript contracts
- Include `@example` blocks for complex types
- Document validation rules and constraints
- Explain business rules and edge cases

Example:
```typescript
/**
 * Represents a TODO item in the system.
 * All properties are readonly to ensure immutability.
 *
 * @example
 * ```typescript
 * const todo: Todo = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   title: 'Review security audit',
 *   status: 'planned',
 *   priority: 'high',
 *   severity: 'medium',
 *   tags: ['security'],
 *   complianceFrameworks: ['SOC 2'],
 *   createdAt: '2024-01-15T10:00:00Z',
 *   updatedAt: '2024-01-15T10:00:00Z',
 *   completedAt: null
 * };
 * ```
 */
export interface Todo {
  /** Unique identifier (UUID v4) */
  readonly id: string;
  // ... other fields
}
```

## Documentation Coverage

Current documentation metrics:

- **Total Lines:** ~7,500 lines of documentation
- **Core Docs:** 8 comprehensive guides
- **API Endpoints:** 6 fully documented
- **Test Coverage:** 169 tests documented
- **Code Examples:** 50+ complete examples
- **Diagrams:** Data flow, architecture, component interaction

## Project Rules

When working with this codebase, follow these mandatory rules:

1. Never return raw OpenSearch responses to UI (use mappers)
2. All OpenSearch operations through repositories only
3. Routes must validate all input
4. Frontend calls only plugin BFF endpoints
5. Include table + chart + search + CRUD + persistence
6. Tests must run in Docker and pass (169/169)
7. Use @elastic/eui components for UI consistency
8. Implement server-side pagination and sorting
9. Keep TypeScript strict, avoid `any`
10. **Update docs as features are added** (not at the end)
11. **UI components must be presentational** (logic in custom hooks)

See [CLAUDE.md](../CLAUDE.md) for complete project rules and guidelines.

## Contributing to Documentation

### Adding New Documentation

1. Create file in appropriate category
2. Add to this README index
3. Follow documentation standards
4. Include table of contents if >500 lines
5. Add cross-references to related docs

### Updating Existing Documentation

1. Update the content
2. Update "Last updated" timestamp
3. Update cross-references if needed
4. Review for broken links
5. Test all code examples

### Reviewing Documentation

During code review, verify:
- Documentation is updated for code changes
- Examples are correct and tested
- Language is professional English
- Cross-references are valid
- Format follows standards

## Getting Help

**For contract/type questions:**
- Check [API Contracts](./contracts.md) first
- View TypeDoc for type hierarchies
- See [API Reference](./api.md) for endpoint contracts

**For architecture questions:**
- Review [Architecture Guide](./architecture.md)
- Check layer responsibilities
- See design patterns section

**For implementation questions:**
- Review [Features Documentation](./features.md)
- Check [Testing Guide](./testing.md) for examples
- See source code with JSDoc comments

**For testing questions:**
- Follow [Testing Guide](./testing.md)
- Review existing test files
- Check coverage reports

## Documentation Roadmap

Planned documentation improvements:

- [ ] Add sequence diagrams for complex workflows
- [ ] Create video tutorials for common tasks
- [ ] Add performance optimization guide
- [ ] Document deployment procedures
- [ ] Create troubleshooting FAQ
- [ ] Add internationalization guide
- [ ] Document security best practices

---

**Last Updated:** 2025-01-01

**Documentation Version:** 1.0.0

**Plugin Version:** 0.0.0
