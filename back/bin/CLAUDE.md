/r# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

"Yoga App" — an OpenClassrooms full-stack testing project. The repo has two apps:
- `back/` (this directory): Spring Boot 3.5 / Java 21 REST API, MySQL, JWT auth.
- `front/`: Angular 19 app (Jest unit tests, Cypress e2e). Its dev server proxies `/api` to `http://localhost:8080` (`front/proxy.conf.json`).

The project's goal is adding tests and raising coverage: the backend JaCoCo `check` rule requires **≥ 90% line coverage per package**; the frontend Jest threshold is 80% statements. There is no `src/test` directory yet.

## Commands (run from `back/`)

Requires JDK 21, Maven 3.9.3+, and Docker running.

```bash
mvn spring-boot:run                     # starts MySQL via compose.yaml (spring-boot-docker-compose), then the app on :8080
mvn test                                # run tests; JaCoCo report -> target/site/jacoco/index.html
mvn test -Dtest=SessionServiceTest      # single test class
mvn test -Dtest=SessionServiceTest#participate_shouldThrowNotFound   # single method
mvn verify                              # also runs jacoco:check (90% line coverage per package)
```

Frontend (from `front/`): `npm run start`, `npm run test`, `npx jest path/to/file.spec.ts`, `npm run lint`, `npm run e2e`, `npm run e2e:coverage`.

## Configuration gotchas

- `configuration/AppConfig.java` loads `.env` via `FileSystemResource(".env")` — a path **relative to the working directory**, so the app (and any `@SpringBootTest`) must run with `back/` as cwd. `.env` provides `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `TOKEN_SECRET`, consumed by `application.yml` and `compose.yaml`.
- Schema is created by Hibernate (`ddl-auto: update`); there are no migrations. The default admin user must be inserted manually from `src/main/resources/sql/insert_user.sql` (login `yoga@studio.com` / `test!1234`).
- Testcontainers (`junit-jupiter`, `mysql`) is already a test dependency for integration tests; `spring-security-test` is available for `@WithMockUser` etc.
- The JaCoCo plugin is pinned to 0.8.5, which predates Java 21 class-file support; if coverage instrumentation fails, bump it (≥ 0.8.11).
- `postman/yoga.postman_collection.json` documents all endpoints.

## Architecture

Package root: `com.openclassrooms.starterjwt`. Classic layered flow: `controllers` → `services` → `repository` (Spring Data JPA), with `mapper` (MapStruct) converting between `models` (JPA entities, Lombok) and `dto`.

- **Domain**: `User`, `Teacher`, `Session`. `Session` has a `@OneToOne` teacher and an eager `@ManyToMany` users list via join table `PARTICIPATE`.
- **Mappers**: `EntityMapper<D, E>` is the generic interface; MapStruct generates implementations at compile time (annotation processors for Lombok + MapStruct are configured in `pom.xml`). `SessionMapper` is an abstract class that injects `TeacherService`/`UserService` and resolves `teacher_id` and `users` (list of user ids) into entities inside `@Mapping(expression = ...)` — so mapping a `SessionDto` hits the database.
- **Error handling** is split between two styles:
  - Controllers parse path ids as `String` and return `400` on `NumberFormatException`, `404` when the service returns `null`.
  - `SessionService.participate`/`noLongerParticipate` throw `NotFoundException`/`BadRequestException`, which map to HTTP status via `@ResponseStatus` (no `@ControllerAdvice`).
- **Security** (`security/`): stateless JWT. `WebSecurityConfig` permits `/api/auth/**` and requires authentication for everything else; CSRF and CORS are disabled. `AuthTokenFilter` reads `Authorization: Bearer <token>`, validates it with `JwtUtils` (secret `oc.app.jwtSecret`, expiry `oc.app.jwtExpirationMs`), and loads `UserDetailsImpl` by email. There are no role-based restrictions — the `admin` flag is only returned to the client in `JwtResponse` at login. `UserController.delete` is the only ownership check (compares the principal's username with the target user's email, `401` on mismatch).
- **Endpoints**: `/api/auth/{login,register}`, `/api/session` (CRUD + `POST|DELETE /{id}/participate/{userId}`), `/api/teacher` (read-only), `/api/user/{id}` (GET, DELETE).
