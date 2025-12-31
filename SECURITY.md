# Custom Plugin Security Policy

Version: 2025-12-30

## Introduction
This document outlines the Security Policy for the Custom Plugin (TODO Management) OpenSearch Dashboards plugin project. It emphasizes our commitment to maintain a secure environment for our users and contributors, and reflects our belief in the power of collaboration to identify and resolve security vulnerabilities.

## Scope
This policy applies to the Custom Plugin OpenSearch Dashboards plugin, including:
- Plugin source code (`src/`)
- Docker development environment (`docker-compose.yml`)
- Configuration files (`config/`)
- Build and deployment scripts
- Documentation

## Reporting Security Vulnerabilities
If you believe you've discovered a potential security vulnerability in this project, we strongly encourage you to report it to us responsibly.

### How to Report

**Do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **Opening a GitHub Security Advisory** under the "Security" tab in this repository, or
2. **Sending an email** with the details of your findings to the project maintainers

### What to Include in Your Report

Please include the following information in your vulnerability report:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass, code injection)
- **Full path of the source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it
- **Your assessment of the severity**

## Security Considerations for This Plugin

### Known Security Boundaries

This OpenSearch Dashboards plugin has the following security-critical areas:

1. **Input Validation**:
   - All route handlers validate input using `@osd/config-schema`
   - Never trust user input - always validate at route level (PROJECT RULE #3)

2. **Data Access Control**:
   - All OpenSearch operations use request-scoped client (`context.core.opensearch.client.asCurrentUser`)
   - Respects OpenSearch Dashboards' built-in authentication and authorization
   - Never expose raw OpenSearch responses to the UI (PROJECT RULE #1)

3. **API Security**:
   - Frontend only calls plugin BFF endpoints (PROJECT RULE #4)
   - No direct OpenSearch access from client-side code
   - All OpenSearch operations through repository layer (PROJECT RULE #2)

4. **Docker Environment**:
   - Development environment only - not for production use
   - Default credentials (`admin` / `Wazuh-1234`) should be changed in production
   - Container ports exposed to localhost only

### Common Vulnerabilities to Watch For

When contributing, please be mindful of:

- **Cross-Site Scripting (XSS)**: Sanitize user input, use React's built-in XSS protection
- **Injection Attacks**: Validate and sanitize all input before OpenSearch queries
- **Authentication/Authorization**: Respect OpenSearch Dashboards' security model
- **Sensitive Data Exposure**: Never log or expose sensitive information
- **Insecure Dependencies**: Keep dependencies up to date
- **Command Injection**: Avoid executing shell commands with user input

## Vulnerability Disclosure Policy

Upon receiving a report of a potential vulnerability, our team will initiate an investigation. If the reported issue is confirmed as a vulnerability, we will take the following steps:

### 1. Acknowledgment
We will acknowledge the receipt of your vulnerability report within **3 business days** and begin our investigation.

### 2. Validation
We will validate the issue and work on reproducing it in our Docker development environment.

### 3. Remediation
We will work on a fix and thoroughly test it using our comprehensive test suite (169 tests across 6 test suites).

The fix will be validated by:
- Running all existing tests (`yarn test`)
- Adding new tests to prevent regression
- Manual testing in the Docker environment
- Code review by maintainers

### 4. Release & Disclosure
After **90 days** from the discovery of the vulnerability, or as soon as a fix is ready and thoroughly tested (whichever comes first), we will:

- Release a security update for the affected version
- Publicly disclose the vulnerability with a CVE (Common Vulnerabilities and Exposures) if applicable
- Acknowledge the discovering party (unless they prefer to remain anonymous)
- Update the [CHANGELOG.md](CHANGELOG.md) with security fix details

### 5. Exceptions
In order to preserve the security of the plugin's user community, we might extend the disclosure period to allow users to patch their deployments.

This 90-day period allows for end-users to update their systems and minimizes the risk of widespread exploitation of the vulnerability.

## Security Testing

### Automated Security Measures

We implement the following automated security measures:

1. **Dependency Scanning**: Regular checks for known vulnerabilities in dependencies
2. **TypeScript Strict Mode**: Enforced to catch type-related issues at compile time
3. **Input Validation**: All routes use `@osd/config-schema` for validation
4. **Test Coverage**: >90% code coverage to catch potential security issues

### Manual Security Review

Before releasing new features, we conduct manual security reviews focusing on:

- Input validation and sanitization
- Authentication and authorization checks
- Data access patterns
- Error handling and information disclosure
- Secure coding practices

## Security Best Practices for Contributors

When contributing to this project, please follow these security best practices:

### Input Validation
```typescript
// ✅ GOOD: Validate all input
router.post(
  {
    path: '/api/custom_plugin/todos',
    validate: {
      body: schema.object({
        title: schema.string({ minLength: 1, maxLength: 200 }),
        description: schema.maybe(schema.string({ maxLength: 1000 })),
        status: schema.oneOf([schema.literal('planned'), schema.literal('done'), schema.literal('error')]),
      }),
    },
  },
  handler
);

// ❌ BAD: No validation
router.post({ path: '/api/custom_plugin/todos' }, handler);
```

### Data Access
```typescript
// ✅ GOOD: Use repository pattern
const client = context.core.opensearch.client.asCurrentUser;
const repository = new TodosRepository(client);
const result = await repository.findById(id);

// ❌ BAD: Direct OpenSearch access from service
const result = await this.client.get({ index: 'todos', id });
```

### Error Handling
```typescript
// ✅ GOOD: Don't expose internal details
catch (error) {
  logger.error('Error creating todo', error);
  return response.internalError({
    body: { message: 'Failed to create todo' }
  });
}

// ❌ BAD: Expose stack traces
catch (error) {
  return response.internalError({
    body: { message: error.message, stack: error.stack }
  });
}
```

### Avoid Common Pitfalls
- **Never use `eval()` or `Function()` with user input**
- **Never execute shell commands with user input**
- **Never store sensitive data in localStorage or cookies without encryption**
- **Never log sensitive information** (passwords, tokens, PII)
- **Never use `any` type** - use explicit types for security-critical code

## Credit

We believe in giving credit where credit is due. If you report a security vulnerability to us, and we determine that it is a valid vulnerability, we will publicly credit you for the discovery when we disclose the vulnerability (unless you wish to remain anonymous).

**To remain anonymous**, please indicate so in your initial report.

We appreciate and encourage feedback from our community. While we currently do not have a bounty program, we deeply value the contributions of security researchers who help make this project safer.

## Compliance with this Policy

We consider the discovery and reporting of security vulnerabilities an important public service. We encourage responsible reporting of any vulnerabilities that may be found in this project.

**We will not take legal action** against or suspend or terminate access to those who discover and report security vulnerabilities in accordance with this policy.

We ask that all users and contributors:
- **Act in good faith** to avoid privacy violations, destruction of data, and interruption or degradation of our services
- **Give us reasonable time** to investigate and fix the issue before making any information public
- **Do not access, modify, or delete data** that does not belong to you
- **Do not exploit vulnerabilities** beyond the minimum necessary to demonstrate the issue
- **Respect this policy** and the security of our community's users

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

We only provide security updates for the latest version of the plugin. Please ensure you are using the latest version before reporting security issues.

## Security Configuration Recommendations

### Development Environment

The default Docker configuration is for **development only**. For production-like testing:

1. **Change default credentials** in `config/opensearch_dashboards.yml`
2. **Enable HTTPS** for OpenSearch and OpenSearch Dashboards
3. **Configure proper CORS** settings
4. **Review and restrict exposed ports** in `docker-compose.yml`
5. **Use secrets management** for sensitive configuration

### OpenSearch Security

This plugin respects OpenSearch Dashboards' built-in security features:
- **Authentication**: Integrates with OpenSearch Dashboards authentication
- **Authorization**: Uses request-scoped OpenSearch client for proper access control
- **Audit Logging**: Leverages OpenSearch Dashboards' audit logging

Ensure these features are properly configured in your environment.

## Changes to this Security Policy

This policy may be revised from time to time. Each version of the policy will be identified at the top of the page by its effective date.

## Contact

If you have any questions about this Security Policy or need to report a security vulnerability, please:

1. Open a GitHub Security Advisory in this repository, or
2. Contact the project maintainers

**Do not use public channels** (issues, discussions, pull requests) to report security vulnerabilities.

---

Thank you for helping keep this project and its users secure! 🔒
