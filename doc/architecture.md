# Architecture And Practices

This project follows a clean, domain-driven architecture with explicit boundaries and test discipline.

## Clean Architecture Boundaries
- Domain: business rules, entities, value objects, policies.
- Application: use cases and HTTP adapters for user interactions.
- Infrastructure: external concerns (repository implementation).

## Domain-Driven Design (DDD)
- Entities model "who" (e.g., EmailOTPRequest).
- Value objects model "what" (e.g., Email).
- Policies encode business rules as pure, reusable objects.

## SOLID Principles
- Single Responsibility: each class/function has one purpose.
- Open/Closed: behavior extended via policies/configuration.
- Liskov Substitution: interfaces define stable contracts.
- Interface Segregation: repositories expose only needed methods.
- Dependency Inversion: domain depends on abstractions.

## Purity And Determinism
- Domain functions avoid side effects and non-determinism.
- Time and randomness are injected through use cases/services.

## Error Handling
- Domain error messages centralized in `src/domain/errors.ts`.
- Errors are snake_case strings suitable for front-end mapping.

## Configuration
- Domain constants centralized in `src/domain/configuration.ts`.

## Testing Practices
- Tests for every new code path.
- AAA (Arrange/Act/Assert) pattern used.
- Non-passing (negative) tests included.

## Repository Pattern
- Interfaces define CRUD operations in infrastructure.
- In-memory repository uses explicit shared state.

## Express HTTP Layer
- Routes are thin and delegate to use cases.
- Use cases manage dependencies and orchestration.
