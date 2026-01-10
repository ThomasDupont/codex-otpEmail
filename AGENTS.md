# AGENTS.md

## Repository expectations
- Always run `npm run check` after finishing modification and correct error if exists
- Respect clean architecture principle :
  - All business rules are going to src/domain/
  - All interaction with API user are going to src/application/
  - All client management (external API, DB) are going to src/infrastucture/
- Respect SOLID principle :
  - SRP : only one responsability by function & class
  - Open/closed: closed to modifification and open to extend
  - Liskov substitution: That is, if S subtypes T, what holds for T-objects holds for S-objects
  - Interface segregation: only needed interface
  - Dependency inversion: The dependency inversion principle (DIP) states to depend upon abstractions, not concretes.
- Respect base DDD principle, inside domain, all Who are entities, all What are value-objects
- Technologies : Express, redis
- Tests : always write test on new code
  - Always write passing tests
  - Always write no-passing tests
