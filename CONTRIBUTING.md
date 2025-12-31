# Contributing to Custom Plugin (TODO Management)

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
> - Star the project
> - Share it with your colleagues
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Styleguides](#styleguides)
- [Commit Messages](#commit-messages)

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](docs/).

Before you ask a question, it is best to search for existing Issues that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an Issue with a clear description
- Provide as much context as you can about what you're running into
- Provide project and platform versions (Docker, Node.js, OpenSearch Dashboards version), depending on what seems relevant
- Include relevant log output from the Docker containers

We will then take care of the issue as soon as possible.

## I Want To Contribute

> ### Legal Notice
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version
- Determine if your bug is really a bug and not an error on your side (e.g., using incompatible Docker versions, incorrect environment setup). If you are looking for support, you might want to check [this section](#i-have-a-question)
- Check if there is not already a bug report existing for your bug or error
- Collect information about the bug:
  - Stack trace (Traceback) from Docker logs
  - OS, Platform and Version (Windows, Linux, macOS)
  - Docker and Docker Compose versions
  - OpenSearch Dashboards version (default: 2.16.0)
  - Your input and the output
  - Can you reliably reproduce the issue? Can you also reproduce it with a fresh Docker environment?

#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be reported according to our [SECURITY.md](SECURITY.md) policy.

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an Issue (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue)
- Explain the behavior you would expect and the actual behavior
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes:
  - Docker commands used
  - Configuration changes made
  - Steps performed in the UI
- Provide the information you collected in the previous section
- Include Docker container logs (`docker compose logs osd` or `docker compose logs os1`)

Once it's filed:

- The project team will label the issue accordingly
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution)

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for the Custom Plugin, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

#### Before Submitting an Enhancement

- Make sure that you are using the latest version
- Read the [documentation](docs/) carefully and find out if the functionality is already covered
- Perform a search to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one
- Find out whether your idea fits with the scope and aims of the project. The plugin is designed as a TODO management system with CRUD, search, filtering, and analytics capabilities

#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as GitHub issues.

- Use a **clear and descriptive title** for the issue to identify the suggestion
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to
- **Explain why this enhancement would be useful** to most users. You may also want to point out other projects that solved it better and which could serve as inspiration

### Your First Code Contribution

#### Environment Setup

This project uses a Docker-based development environment. To get started:

1. **Prerequisites**:
   - Docker and Docker Compose installed
   - On Linux: Increase virtual memory with `sudo sysctl -w vm.max_map_count=262144`
   - At least 4GB of free RAM

2. **Clone the repository** and navigate to the project directory

3. **Start the Docker environment**:
   ```bash
   docker compose up -d
   ```

4. **Attach to the OpenSearch Dashboards container**:
   - Using VS Code: "Attach to Running Container" feature
   - Or use: `docker exec -it dev_environment-osd-1 bash`

5. **Navigate to the OpenSearch Dashboards directory**:
   ```bash
   cd /home/node/kbn
   ```

6. **Start the development server**:
   ```bash
   yarn start --no-base-path
   ```

7. **Access the application**:
   - URL: http://localhost:5601
   - Credentials: `admin` / `Wazuh-1234`

For detailed setup instructions, see [CLAUDE.md](CLAUDE.md).

## Development Workflow

### Project Structure

The plugin follows a strict layered architecture:

**Backend (Server-Side)**:
- `src/server/routes/` - HTTP endpoint definitions
- `src/server/controllers/` - Request/response handling
- `src/server/services/` - Business logic
- `src/server/repositories/` - OpenSearch data access (single boundary)
- `src/server/mappers/` - Data transformation
- `src/server/errors/` - Custom error hierarchy

**Frontend (Client-Side)**:
- `src/public/plugin.ts` - Plugin registration
- `src/public/application.tsx` - React app entry point
- `src/public/features/todos/` - Feature-first organization
  - `api/` - HTTP client
  - `hooks/` - Custom React hooks
  - `ui/` - React components

**Common (Shared)**:
- `src/common/constants.ts` - Plugin ID, API paths
- `src/common/todo/todo.types.ts` - Domain entities
- `src/common/todo/todo.dtos.ts` - API contracts

### Making Changes

1. **Read existing code** before making modifications. Never propose changes to code you haven't read
2. **Follow the PROJECT RULES** defined in [CLAUDE.md](CLAUDE.md):
   - Never return raw OpenSearch responses to the UI
   - All OpenSearch operations must go through repositories
   - Routes must validate input
   - Frontend must call only plugin BFF endpoints
   - Include table + chart + search + CRUD + persistence
   - Tests must run in Docker and be green
   - Use @elastic/eui components for UI
   - Add pagination + sorting (server-side)
   - Keep TypeScript strict; avoid `any`
   - Update documentation as features are added

3. **Avoid over-engineering**:
   - Only make changes that are directly requested or clearly necessary
   - Keep solutions simple and focused
   - Don't add features, refactor code, or make "improvements" beyond what was asked
   - Don't add error handling for scenarios that can't happen

4. **Hot Reload**:
   - Server changes: Server automatically restarts
   - Frontend changes: Code re-optimized and browser updates (disable browser cache)

### Building the Plugin

Inside the container at `/home/node/kbn/plugins/custom_plugin`:

```bash
yarn build
```

## Testing Guidelines

The plugin has comprehensive test coverage with 169 tests across 6 test suites.

### Running Tests

Inside the container at `/home/node/kbn/plugins/custom_plugin`:

```bash
# Run all tests
yarn test

# Run with coverage report
yarn test --coverage

# Watch mode
yarn test --watch

# Run specific suite
yarn test server/__tests__/todos.service.test.ts
yarn test public/features/todos/__tests__/TodoForm.test.tsx
```

### Test Requirements

- **All tests must pass** before submitting a pull request
- **Expected results**: 169 passed, 169 total
- **Coverage**: >90% statements, >85% branches
- **Test location**:
  - Server tests: `src/server/__tests__/`
  - Client tests: `src/public/features/todos/__tests__/`

For comprehensive testing documentation, see [docs/testing.md](docs/testing.md).

### Writing Tests

- Use Jest for both server and client-side tests
- Use React Testing Library for component tests
- Mock external dependencies (OpenSearch client, API calls)
- Follow existing test patterns in the codebase
- Test both success and error scenarios
- Ensure tests are deterministic and don't depend on external state

## Styleguides

### TypeScript Style

- **Strict TypeScript**: Enable strict mode, avoid `any`
- **Explicit types**: Use explicit types for variables, parameters, and return values
- **Naming conventions**:
  - PascalCase for classes, interfaces, types, enums
  - camelCase for functions, variables, methods
  - UPPER_SNAKE_CASE for constants
- **File naming**: kebab-case (e.g., `todos.service.ts`)

### Code Organization

- **Import order**:
  1. External dependencies
  2. OpenSearch Dashboards core imports
  3. Plugin imports (common, server, public)
  4. Relative imports
- **One component per file**
- **Export at the bottom** of the file (except for default exports)

### React/Frontend Style

- **Use functional components** with hooks
- **Use @elastic/eui components** for UI consistency
- **Custom hooks** for reusable logic
- **Props interface** for each component
- **Destructure props** in function signature

### Backend Style

- **Layered architecture**: Follow the 5-layer pattern (Routes → Controllers → Services → Repositories → Mappers)
- **Single Responsibility Principle**: Each layer has one responsibility
- **Dependency Injection**: Pass dependencies through constructors
- **Error handling**: Use custom error classes from `src/server/errors/`

### Documentation Style

- **English only**: All code, comments, and documentation must be in English
- **Clear and concise**: Use professional technical English
- **Update documentation** as you add features
- **Code comments**: Only where logic isn't self-evident
- **API documentation**: Update `docs/api.md` for new endpoints
- **Architecture documentation**: Update `docs/architecture.md` for structural changes

## Commit Messages

General rules to follow while writing commit messages:

- **Create small commits** - Each commit should represent a logical unit of work
- **Preserve history** - Don't rewrite published history
- **Sign commits** - Use GPG signing if possible
- **Always use the English language**
- **Separate the subject from the body** with a blank line
- **Limit the subject line to 50 characters**
- **Capitalize the subject line**
- **Do not end the subject line with a period**
- **Use the imperative mood** in the subject line, as if you were commanding someone:
  - ✅ "Fix authentication bug"
  - ✅ "Add search filtering"
  - ✅ "Update documentation"
  - ❌ "Fixed authentication bug"
  - ❌ "Added search filtering"
  - ❌ "Updated documentation"
- **Wrap the body at 72 characters**
- **Use the body to explain what and why**, not how

### Commit Message Examples

```
Add pagination to TODO list

Implement server-side pagination with configurable page size.
Supports 10, 20, 50, and 100 items per page.
```

```
Fix date formatting in TodosTable

Use EuiDateFormatter for consistent date display.
Resolves timezone issues in completion date column.
```

```
Update API documentation for search endpoint

Add examples for full-text search with fuzzy matching.
Document new filter parameters.
```

## Pull Request Process

1. **Ensure all tests pass** (`yarn test`)
2. **Update documentation** for any new features or changes
3. **Follow commit message guidelines**
4. **Provide a clear PR description**:
   - What changes were made
   - Why these changes were necessary
   - How to test the changes
5. **Reference related issues** (e.g., "Fixes #123")
6. **Keep PRs focused** - One feature or fix per PR
7. **Request review** from maintainers

## Questions?

If you have any questions about contributing, please open an issue with the label "question" or refer to the [documentation](docs/).

Thank you for contributing! 🎉
