---
name: Frontend Angular 20 test patterns
description: Key patterns and gotchas for writing unit tests in the Angular 20 frontend of this monorepo
type: project
---

All Angular specs use `provideZonelessChangeDetection()` in providers — the app is zoneless.

**AuthService.logout() is fire-and-forget**: it fires an internal HTTP POST and returns void. Tests must flush the `/auth/logout` request via `HttpTestingController` in `afterEach(() => httpMock.verify())` or the verify call will fail.

**AuthComponent form shapes**:
- `loginForm`: `{ email, password, remember }` (3 fields — `remember` defaults to `false`)
- `registerForm`: `{ fullName, email, password }` (3 fields)
- Both forms only pass `{ email, password }` to the service (fullName and remember are stripped)

**authInterceptor behaviour**: sets `withCredentials: true` on ALL requests (including auth endpoints). The `Authorization: Bearer <token>` header is only added on non-auth routes (`/auth/login` and `/auth/register` are skipped).

**App component**: class is named `App` (not `AppComponent`), exported from `src/app/app.ts`. Template uses `<router-outlet>`. Tests must include `provideRouter([])`.

**Component file naming**: Angular 20 project uses shorthand filenames — `app.ts`, `app.html`, `app.scss` (no `.component` infix for the root App).

**Why:** discovered while writing the first set of frontend specs in March 2026.
**How to apply:** Always read the actual source before writing specs; never assume form shape from service interface alone.
