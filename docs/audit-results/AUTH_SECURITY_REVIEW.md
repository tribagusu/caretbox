# Auth Security Review

**Last audited:** 2026-04-04
**Audited by:** auth-auditor agent
**Scope:** Authentication, email verification, password reset, profile management

---

## Summary

The authentication implementation is generally well-structured and follows good patterns for token namespacing, info-disclosure avoidance, and session validation on protected API routes. Two exploitable issues were found: the route-protection middleware is silently dead (never registered with Next.js) meaning all "protected" routes are publicly accessible by direct URL, and the registration endpoint leaks account existence via a distinct HTTP 409 status code. No passwords are logged or returned to clients.

---

## Findings

### [CRITICAL] Route protection middleware is never registered — all protected pages are publicly accessible

- **File:** `src/proxy.ts`
- **Line(s):** 1-17
- **Issue:** Next.js middleware must live in a file named `middleware.ts` (or `middleware.js`) at the project root or inside `src/`. The file `proxy.ts` exports a named export `proxy` and a `config` object, but there is no `src/middleware.ts` file and `next.config.ts` does not reference `proxy.ts` in any way. Next.js has no knowledge of this file and never executes it. As a result, the redirect logic protecting `/dashboard/*` and `/profile/*` is completely inert.
- **Code:**
  ```typescript
  // src/proxy.ts — never executed by Next.js
  export const proxy = auth((req) => {
    const path = req.nextUrl.pathname;
    if (!req.auth && (path.startsWith("/dashboard") || path.startsWith("/profile"))) {
      const signInUrl = new URL("/sign-in", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return Response.redirect(signInUrl);
    }
  });

  export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  };
  ```
- **Impact:** Any unauthenticated visitor can navigate directly to `/dashboard`, `/profile`, or any sub-route. The page-level `auth()` checks in `profile/page.tsx` (line 8) do enforce authentication for that one page, but there is no guarantee that every dashboard route performs its own server-side auth check. If any dashboard page or layout fetches data without its own `auth()` guard, that data is exposed without authentication. Additionally, the UX protection (redirect to sign-in) is entirely absent for all routes.
- **Fix:** Create `src/middleware.ts` that re-exports `proxy` as the default export and re-exports `config`:
  ```typescript
  // src/middleware.ts
  export { proxy as default, config } from "./proxy";
  ```
  Then verify every dashboard page/layout also has a server-side `auth()` guard as defense-in-depth, since middleware alone should not be the sole auth gate.

---

### [MEDIUM] Registration endpoint reveals account existence via HTTP 409

- **File:** `src/app/api/auth/register/route.ts`
- **Line(s):** 25-31
- **Issue:** When a registration attempt uses an email that already has an account, the endpoint returns HTTP `409 Conflict` with the body `{ "error": "A user with this email already exists" }`. An attacker can enumerate whether any email address is registered by submitting registration requests and inspecting the status code.
- **Code:**
  ```typescript
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }
  ```
- **Impact:** An attacker can enumerate the user base by trying known or leaked email lists. This is especially useful before a credential-stuffing attack and has privacy implications (revealing that a person has an account on this service).
- **Fix:** Return a generic `200 OK` with a message such as "If this email is not already registered, you will receive a verification email" — identical to success. If the email exists, silently send a "someone tried to register with your email" notification to the existing user. This is the same pattern already correctly used in `forgot-password` and `resend-verification`. Alternatively, if account enumeration is acceptable for your threat model (many services allow it), at minimum remove the explicit "already exists" message and return `400` with a generic error.

---

### [MEDIUM] `verifyToken` (email verification) has no namespace guard — a password-reset token can verify an email address

- **File:** `src/lib/tokens.ts`
- **Line(s):** 28-37
- **Issue:** `verifyToken` looks up any token in the `VerificationToken` table using only the raw token value, with no filter on the `identifier` prefix. Password-reset tokens are stored with `identifier = "pwd-reset:<email>"`. If an attacker somehow obtains a password-reset token (e.g., from server logs when `SKIP_EMAIL_VERIFICATION=true`, see finding below), they could submit it to `GET /api/auth/verify-email?token=<reset_token>`. `verifyToken` would find the record. The subsequent `prisma.user.update` at `verify-email/route.ts` line 26 does `where: { email: record.identifier }` — this would fail to find a user because the identifier is `"pwd-reset:user@example.com"`, not `"user@example.com"`, so the update silently fails. The token is then deleted. Net practical impact is low (the attacker burns the reset token without gaining access), but the lack of namespace isolation in `verifyToken` is a structural weakness.
- **Code:**
  ```typescript
  // verifyToken has no prefix guard
  export async function verifyToken(token: string) {
    const record = await prisma.verificationToken.findFirst({
      where: { token },  // matches pwd-reset: records too
    });
    ...
  }
  ```
- **Impact:** A password-reset token submitted to the email-verification endpoint will be consumed (deleted) without granting any access. The attacker effectively invalidates the victim's password-reset link without being able to use it — a denial-of-service on the reset flow. This requires the attacker to already possess the reset token.
- **Fix:** Add a prefix exclusion to `verifyToken`:
  ```typescript
  export async function verifyToken(token: string) {
    const record = await prisma.verificationToken.findFirst({
      where: {
        token,
        NOT: { identifier: { startsWith: "pwd-reset:" } },
      },
    });
    ...
  }
  ```

---

### [LOW] Password-reset tokens are logged in plaintext to the console when `SKIP_EMAIL_VERIFICATION=true`

- **File:** `src/app/api/auth/forgot-password/route.ts`
- **Line(s):** 29-31
- **Issue:** When the environment variable `SKIP_EMAIL_VERIFICATION` is `"true"`, the password-reset token is logged to the server console in plaintext. In many deployment environments (Vercel, Railway, Render, etc.) console output is captured and stored in a log management system, may be indexed for search, and can be accessible to team members or third-party log aggregators.
- **Code:**
  ```typescript
  if (process.env.SKIP_EMAIL_VERIFICATION === "true") {
    console.log(`[Password Reset] Token for ${email}: ${token}`);
  }
  ```
- **Impact:** If `SKIP_EMAIL_VERIFICATION=true` is ever left active in a staging environment that has real user data, or if log storage is compromised, an attacker with log access can extract valid password-reset tokens and take over accounts. The risk window is the token TTL (1 hour).
- **Fix:** This debug pattern is intentional for local development, but should be bounded more tightly. Add a check for `NODE_ENV !== "production"` to ensure the log line can never fire in production regardless of the env var value:
  ```typescript
  if (process.env.SKIP_EMAIL_VERIFICATION === "true" && process.env.NODE_ENV !== "production") {
    console.log(`[Password Reset] Token for ${email}: ${token}`);
  }
  ```
  Additionally, document that `SKIP_EMAIL_VERIFICATION` must never be set to `"true"` in any environment with real user data.

---

### [LOW] No server-side password strength policy beyond minimum length

- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts`
- **Line(s):** register: 33 (implicit, no check); reset-password: 16-19; change-password: 22-25
- **Issue:** The only password constraint enforced server-side is a minimum length of 8 characters. There is no check for maximum length, character complexity, or membership in known-breached password lists. A password of `aaaaaaaa` (8 `a`s) is accepted. There is also no maximum-length check: bcrypt silently truncates inputs beyond 72 bytes, meaning a 200-character password and a 73-character password with the same first 72 characters would produce the same hash.
- **Code:**
  ```typescript
  // reset-password/route.ts line 16
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }
  ```
- **Impact:** The bcrypt truncation issue means two different passwords can authenticate the same account, which could surprise users or cause subtle issues. Weak passwords increase susceptibility to credential stuffing once hashes are exposed.
- **Fix:** Add a maximum length check (e.g., 128 characters) on all three routes server-side. Consider adding a common-password blocklist check using a library like `zxcvbn` or a simple top-1000 list for the MVP.

---

## Passed Checks

| Check | Status | Notes |
|-------|--------|-------|
| bcrypt cost factor | PASS | Cost factor is 10 in all three hashing sites (register line 33, reset-password line 32, change-password line 50). Meets minimum recommended value. |
| Password never logged or returned to client | PASS | `select: { password: true }` is used only for internal comparison; the `password` field is never included in any API response. `ProfileData` converts it to `hasPassword: boolean` in `profile.ts` line 39. |
| Email verification token is crypto-random | PASS | `crypto.randomUUID()` is used in `tokens.ts` line 9 — cryptographically secure. |
| Email verification token TTL | PASS | 24-hour expiry set in `tokens.ts` line 4. Reasonable for email verification. |
| Email verification token is single-use | PASS | Token deleted immediately after use in `verify-email/route.ts` line 30 via `deleteVerificationToken`. |
| Email verification info disclosure | PASS | `resend-verification/route.ts` returns `{ success: true }` for both found and not-found emails (line 27). |
| Password reset token is crypto-random | PASS | `crypto.randomUUID()` used in `tokens.ts` line 46. |
| Password reset token TTL | PASS | 1-hour expiry in `tokens.ts` line 5. |
| Password reset token is single-use | PASS | Token deleted in `reset-password/route.ts` line 39 before returning success. |
| Password reset info disclosure | PASS | `forgot-password/route.ts` always returns `{ success: true }` regardless of whether the email exists or has a password (line 24-25). |
| Namespace separation between reset and verify tokens | PASS | `generatePasswordResetToken` uses `"pwd-reset:"` prefix (tokens.ts line 6, 50). `verifyPasswordResetToken` filters `startsWith: "pwd-reset:"` (line 65). Prevents a verify token from being used as a reset token. (Note: the reverse is not fully guarded — see Finding 3.) |
| Token collision between users | PASS | Existing tokens are deleted before creating new ones in both `generateVerificationToken` (line 13) and `generatePasswordResetToken` (line 51), preventing stale token reuse. |
| Change-password requires current password | PASS | `change-password/route.ts` verifies `currentPassword` against the stored hash via `bcrypt.compare` (line 41) before updating. |
| Change-password session validation | PASS | `auth()` is called at line 7; returns 401 if no session. |
| Delete-account session validation | PASS | `auth()` is called at line 6 of `account/route.ts`; returns 401 if no session. |
| Delete-account cascade | PASS | Schema has `onDelete: Cascade` on all user-owned models (Account, Session, Item, ItemType, Collection, Tag). `ItemTag` cascades via Item and Tag. Comment in `account/route.ts` line 13-15 documents this correctly. |
| Password hash excluded from profile response | PASS | `getProfileData` in `profile.ts` fetches `password` internally but returns only `hasPassword: boolean` (line 39). The hash is never serialized to the client. |
| Profile page server-side auth | PASS | `profile/page.tsx` calls `auth()` and redirects to `/sign-in` if no session (lines 8-10). |
| GitHub OAuth users blocked from password reset | PASS | `forgot-password/route.ts` silently returns success if `user.password` is null (line 23), so OAuth-only users cannot receive a reset link. |
| JWT `id` propagation | PASS | `jwt` callback sets `token.id = user.id` and `session` callback sets `session.user.id = token.id`. User ID is always available server-side via `session.user.id`. |

---

## Recommendations

1. **Add rate limiting to all auth API routes.** None of the routes (`/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/change-password`) have any rate limiting. Without it, brute-force attacks on passwords and token-guessing attacks (though difficult with UUID tokens) are unconstrained. Use an edge-compatible solution such as Upstash Rate Limit or Next.js middleware-level rate limiting by IP.

2. **Invalidate existing sessions on password change and reset.** After a successful password change (`change-password`) or password reset (`reset-password`), any existing active NextAuth JWT sessions remain valid until they expire naturally. A more secure approach is to embed a `passwordChangedAt` timestamp in the JWT and validate it on each request, or force re-authentication by signing the user out server-side. This limits the blast radius if an attacker resets a password while the legitimate user is still logged in.

3. **Consider constraining the `callbackUrl` redirect.** `proxy.ts` line 10 passes `req.nextUrl.pathname` as the `callbackUrl` parameter, and `SignInForm.tsx` line 14 reads it from query params and uses it as the redirect target after sign-in. If an attacker constructs a link like `/sign-in?callbackUrl=/malicious-internal-path`, NextAuth will redirect there after login. NextAuth v5 does validate that `callbackUrl` is a relative path, so open redirect to an external domain is already mitigated by the framework, but verify this behavior holds in your specific NextAuth beta version.

4. **Zod validation on API route inputs.** The register, forgot-password, and reset-password routes parse `request.json()` directly with destructuring and only perform presence checks. Using Zod schemas would add type-safe validation (email format, string max lengths, no unexpected fields) with minimal code.

5. **Remove the unused `off` import in `next.config.ts`.** `import { off } from "process"` at line 2 is dead code and should be removed to keep the config clean.
