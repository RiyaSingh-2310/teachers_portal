# Teachers Portal — Project Setup

**Status:** Setup plan only. No dashboard, no route implementation, and no changes to other apps.  
**Date:** 21 October 2026  
**Product requirements:** `TEACHER_PORTAL_MODULES.md`  
**UI specification:** `TEACHER_DASHBOARD_UI.md`  
**Visual reference:** School ERP Client UI (`ERPWEB/ERPCLIENTWEB`, package `spdf-parent-web`)  
**This project:** `TeachersPortal/teachers-portal`  
**Leave untouched:** `ERPWEB/ERPCLIENTWEB`, `ERPWEB/ERPADMIN`, `ERPWEB/ERPBACKEND`

---

## 1. Where this project lives

The dedicated Teachers Portal is the Next.js app already in this workspace:

```text
TeachersPortal/teachers-portal
```

Do not create a second app. Do not move teacher screens into the parent Client UI or the Admin Portal. Those applications stay as they are. Shared look comes from copying the Client UI’s tokens and small primitives into this project later, not from a workspace package link and not from editing the parent source.

Run it on port **3001** so it can sit beside the parent portal, which uses port 3000.

```bash
cd TeachersPortal/teachers-portal
npm install
npm run dev -- -p 3001
```

The planned `dev` script is `next dev -p 3001`. That script change is part of implementation, not part of this document.

---

## 2. What exists today

### 2.1 This workspace

`create-next-app` output. It is not yet the teacher product.

| Item | Current value |
| --- | --- |
| Next.js | `16.4.2` |
| React / React DOM | `19.3.0` |
| TypeScript | `^5`, `strict: true` |
| Tailwind CSS | `^4`, wired by `@tailwindcss/turbopack` inside `next.config.ts` |
| ESLint | `^9` with `eslint-config-next` `16.4.2` (`core-web-vitals` and `typescript`) |
| App Router | `app/layout.tsx`, `app/page.tsx`, `app/globals.css` at the project root |
| Path alias | `@/*` → `./*` (project root, not `src/`) |
| Fonts | Geist and Geist Mono from `next/font` |
| Styling | Default create-next-app tokens. No brand indigo, no Plus Jakarta Sans |
| UI kit | None. No Button, Card, or shell |
| Auth | None |
| Data | None |
| Assets | `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`, plus `app/favicon.ico`. These are the framework defaults. There is no school logo. |

`next.config.ts` already sets `cacheComponents`, `partialPrefetching`, and `experimental.agentFeedback`. Keep that file’s Next 16.4 behavior. Read `node_modules/next/dist/docs/` before using a new Next 16 API. Do not downgrade this app to the parent portal’s Next `16.3.4`.

The root layout uses the Next 16 typed helper `LayoutProps<"/"`. Keep that pattern when routes are added.

### 2.2 Client UI to follow visually

| Item | Parent Client UI |
| --- | --- |
| Next.js | `16.3.4` |
| React | `19.2.8` |
| Structure | `src/` with `@/*` → `./src/*` |
| Tailwind | v4 through `@tailwindcss/postcss` |
| Font | Plus Jakarta Sans (`next/font/google`) |
| Theme | `next-themes`: light, dark, system. Tokens in `src/styles/tokens.css` |
| Primitives | `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Dropdown`, `EmptyState`, `Skeleton`, `Calendar`, `DatePicker` |
| Shell | `Sidebar`, `Header`, `PageContainer` |
| Server state | TanStack Query v5 |
| Client UI state | Zustand. Includes a parent-only child selector. |
| Forms | `react-hook-form`, `@hookform/resolvers`, `zod` v4 are installed. The login form itself is local state. |
| Feedback | `sonner` |
| Icons | `lucide-react` |
| Data boundary | Repository interfaces, mock implementations, factory on `NEXT_PUBLIC_DATA_SOURCE` |
| Auth | Firebase email/password and Google, plus a demo session when Firebase is unset |
| Dates | `date-fns`. `formatDate` defaults to `en-IN`. `formatCurrency` defaults to INR. |

Parent-only dependencies that this portal does not install: `firebase`, `leaflet`, `react-leaflet`.

### 2.3 Backend that actually exists

From `ERPWEB/ERPBACKEND/docs/api.md` and `src/modules`. Business modules are not implemented. These routes exist:

| Method | Path | Documented use |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Admin password sign-in (Argon2id). Body: email, password of 8–128 characters. |
| POST | `/api/v1/auth/refresh` | Rotate a session. Body: refresh token. |
| POST | `/api/v1/auth/logout` | Revoke a session. Body: refresh token. |
| POST | `/api/v1/auth/firebase` | Parent Firebase ID token exchange. |
| POST | `/api/v1/uploads/presign` | S3 presigned PUT. JPEG, PNG, HEIC, HEIF, PDF. |
| POST | `/api/v1/uploads` | Multipart upload, same MIME allow-list. |

There is no teacher login, no teacher role check on those auth routes, no password-change route, no forgot-password route, and no teacher-scoped academic API. Success and error envelopes are documented in that same API note. This frontend must not call the admin or parent auth routes and present the result as a teacher session.

---

## 3. Target shape

Implementation later moves the App Router under `src/` so this app matches the Client UI layout. Until that pass, the create-next-app files stay where they are. This document does not perform the move.

```text
teachers-portal/
  PROJECT_SETUP.md
  TEACHER_PORTAL_MODULES.md
  TEACHER_DASHBOARD_UI.md
  .env.example
  .env.local                 # gitignored
  next.config.ts
  postcss.config.mjs         # not used; Tailwind stays on the existing turbopack rule
  package.json
  tsconfig.json              # "@/*": ["./src/*"]
  public/                    # favicon only; drop unused framework SVGs when the shell exists
  src/
    app/
      layout.tsx             # html, Plus Jakarta Sans, providers
      globals.css            # Tailwind v4 + token mapping
      page.tsx               # redirect to /login
      (auth)/
        layout.tsx           # guest-only
        login/page.tsx
        forgot-password/page.tsx
      (portal)/
        app/
          layout.tsx         # teacher shell: sidebar, header, main
          page.tsx           # dashboard (later)
          day/page.tsx
          timetable/page.tsx
          calendar/page.tsx
          classes/page.tsx
          classes/[assignmentId]/page.tsx
          students/page.tsx
          students/[studentId]/page.tsx
          attendance/page.tsx
          homework/page.tsx
          homework/new/page.tsx
          homework/[assignmentId]/page.tsx
          messages/page.tsx
          messages/[messageId]/page.tsx
          messages/new/page.tsx
          profile/page.tsx
          settings/page.tsx
          settings/password/page.tsx
          settings/sessions/page.tsx
          leave/page.tsx
          leave/new/page.tsx
          lessons/page.tsx
          syllabus/page.tsx
          exams/page.tsx
          exams/[examId]/papers/[scheduleId]/page.tsx
          resources/page.tsx
          reports/page.tsx
    components/
      ui/                    # Button, Input, Card, Badge, Avatar, Dropdown, EmptyState, Skeleton
      layout/                # Sidebar, Header, PageContainer
      providers/             # Theme, Query, Auth
    features/
      auth/
      dashboard/
      classes/
      students/
      attendance/
      homework/
      messages/
      profile/
      settings/
      leave/
      lessons/
      exams/
      resources/
      reports/
    config/
      app.ts
      navigation.ts
      phase.ts
    auth/
      AuthProvider.tsx
      guards.tsx
      types.ts
    repositories/
      interfaces/
      mock/
      api/
      index.ts
    mocks/                   # fixture records. Mock repositories are the only importers.
    types/
      domain.ts
      api.ts
    stores/
      ui.ts                  # sidebar only
    styles/
      tokens.css             # copy of the Client UI token sets
    lib/
      utils.ts               # cn, date helpers
      api/
        client.ts            # used only when DATA_SOURCE=api
        errors.ts
```

### Route groups

| Group | URL | Who |
| --- | --- | --- |
| `(auth)` | `/login`, `/forgot-password` | Signed-out teachers. No sidebar. |
| `(portal)/app` | `/app/...` | Signed-in teachers. Shell from `TEACHER_DASHBOARD_UI.md` section 5. |

Route groups do not appear in the URL. The portal prefix `/app` matches the parent portal so deep links read the same way, on a different origin and port.

`src/app/page.tsx` redirects to `/login`. It does not render the create-next-app starter.

### Layouts

| Layout | Responsibility |
| --- | --- |
| Root | `lang="en"`, Plus Jakarta Sans on `--font-sans`, `ThemeProvider`, `QueryClientProvider`, `AuthProvider`, `Toaster`. `suppressHydrationWarning` on `<html>` because `next-themes` sets the class. |
| `(auth)` | `GuestGuard`. Centers nothing by itself; the login page owns the split canvas. |
| `(portal)/app` | `AuthGuard`, then `Sidebar` and `Header`. `<main id="main" className="flex-1 overflow-x-hidden px-4 py-6 md:px-6">`. Skip link targets `#main`. |

Feature pages stay thin: `src/app/(portal)/app/homework/page.tsx` renders `HomeworkPage` from `src/features/homework`. Lists, forms, and query hooks live in the feature folder.

### Navigation

`src/config/navigation.ts` is the only sidebar source. Each item has:

```ts
type TeacherNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: "teaching" | "school" | "account";
  minPhase: 1 | 2 | 3;
  permission: TeacherPermission;
};
```

Phase 1 items are Home, My day, My classes, Students, Attendance, Homework, Calendar, Messages, Profile, and Settings. Phase 2 and 3 items from the UI spec are in the same array and are filtered out until `NEXT_PUBLIC_PORTAL_PHASE` allows them. They are not shown with a “Soon” badge.

Active state matches the parent sidebar: Home is exact `/app`. Every other item uses a path prefix.

There is no child selector, no fee item, and no link to the Admin Portal.

---

## 4. Component strategy

Use the Client UI’s own primitives. Do not add MUI, Chakra, Radix-as-a-kit, or the shadcn CLI. The parent set is small enough to recreate in `src/components/ui` from the same class patterns:

| Primitive | Source pattern | Notes for teachers |
| --- | --- | --- |
| `Button` | `cva` variants primary, secondary, outline, ghost, danger | Same heights. |
| `Input` | Label, hint, `error` slot, `h-11` | `aria-invalid` and `aria-describedby` when `error` is set. |
| `Card` | `rounded-xl border bg-card shadow-sm` | Solid cards. Do not use `GlassTiltCard` on teaching screens. |
| `Badge` | Status word plus color | Present, Absent, Late, Draft, Published. |
| `Avatar` | Initials or image | Teacher in the header, students on lists. |
| `Dropdown` | Custom listbox | Class, section, subject, and year filters. |
| `EmptyState` / `ErrorState` | Dashed panel, optional Retry | Permission state uses the same shell with a lock icon. |
| `Skeleton` | `animate-pulse bg-muted` | One per region, not a single full-page spinner after the shell is up. |
| `PageContainer` | `max-w-7xl`, title, description, actions | Every page except the dashboard, which has its own welcome row. |
| `Sidebar`, `Header` | Parent shell measurements | Copy in `TEACHER_DASHBOARD_UI.md` section 5. Collapsed mark is **S**. |

Styling utilities:

- `cn()` from `clsx` and `tailwind-merge`.
- Semantic classes only: `bg-background`, `bg-card`, `text-muted-foreground`, `bg-brand`, `text-brand`. No raw hex in feature components.
- Tokens copied from `ERPCLIENTWEB/src/styles/tokens.css` into `src/styles/tokens.css`, then mapped in `globals.css` with Tailwind v4 `@theme inline`, as the parent `globals.css` does.
- Keep this app’s Tailwind pipeline (`@tailwindcss/turbopack` in `next.config.ts`). Do not also install `@tailwindcss/postcss`.
- Replace Geist with Plus Jakarta Sans when the root layout is rewritten. Drop the create-next-app `Arial` body rule.
- Dark mode is class-based through `next-themes` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`). Remove the scaffold’s `@media (prefers-color-scheme: dark)` token block so it does not fight `next-themes`.
- `date-fns` for the date-range filter the parent updates screen uses. Format dates with the school timezone from the session once a school payload exists. Do not copy the parent helpers that force `en-IN` and INR. This portal does not format money.

Icons are `lucide-react`, the set named in the UI spec.

---

## 5. Mock data, types, and the API boundary

Same rule as the parent repository guide: screens and feature components never import `@/mocks/*`.

```text
Feature UI
  → TanStack Query
    → repository factory (src/repositories/index.ts)
      → mock implementation     when NEXT_PUBLIC_DATA_SOURCE=mock (default)
      → api implementation      when NEXT_PUBLIC_DATA_SOURCE=api
```

The factory returns the mock. In `api` mode every method throws `PortalError` with code `API_NOT_READY` and a message that names the missing capability. It does not call `/api/v1/auth/login` or `/api/v1/auth/firebase` as a stand-in.

### Fixture rules

- Fixture records live in `src/mocks/`.
- They match the people and dates in `TEACHER_DASHBOARD_UI.md` section 19 (Meera Iyer, 21 October 2026, Grade 8 A, and the six named students).
- Mock repositories may delay by about 300ms so loading skeletons can be seen.
- A production build with `NEXT_PUBLIC_DATA_SOURCE=api` must not contain a path that returns those fixtures.
- The login form does not prefill the fixture email or password and does not show a demo banner.

### Types

`src/types/domain.ts` holds the teacher domain. Important ids are strings (the database uses UUIDs). Minimum Phase 1 types:

| Type | Holds |
| --- | --- |
| `TeacherSession` | `userId`, `staffId`, `schoolId`, `email`, `displayName`, `role: "TEACHER"`, `phase` |
| `SchoolContext` | `name`, `timezone`, `academicYear` |
| `TeachingAssignment` | academic year, class, section, subject, `isPrimary`, student count |
| `TimetablePeriod` | day, period, start, end, room, assignment id |
| `StudentSummary` | id, name, roll number, class, section, attendance percent, open homework count |
| `StudentProfile` | summary plus optional guardian name. Phone and email omitted unless a later school flag exists. |
| `AttendanceRegister` | date, section, rows, `canMark`, window state |
| `HomeworkTask` | title, class, subject, due, status, submission counts |
| `Announcement` | title, body, sender, read time |
| `Page<T>` | `items`, `page`, `limit`, `total` |

`src/types/api.ts` describes the documented envelope only:

```ts
type ApiSuccess<T> = { success: true; data: T };
type ApiPage<T> = ApiSuccess<T[]> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};
type ApiFailure = {
  success: false;
  error: { code: string; message: string; requestId?: string };
};
```

That envelope is how the backend says it will respond. It is not evidence that a teacher route exists.

### Repository interfaces (Phase 1)

| Interface | Methods the UI will need | API status |
| --- | --- | --- |
| `AuthRepository` | `login`, `logout`, `currentSession` | No teacher route. See section 10. |
| `DashboardRepository` | `getHome(staffId, academicYearId)` | Not implemented. |
| `TeachingLoadRepository` | `listAssignments`, `getAssignment` | Not implemented. |
| `TimetableRepository` | `getDay`, `getWeek` | Not implemented. |
| `StudentRepository` | `list`, `getById` | Not implemented. Scope is the teacher’s sections. |
| `AttendanceRepository` | `getRegister`, `saveRegister`, `getHistory` | Not implemented. `saveRegister` rejects in the mock when `canMark` is false. |
| `HomeworkRepository` | `list`, `get`, `saveDraft`, `publish`, `saveFeedback` | Not implemented. |
| `MessageRepository` | `list`, `get`, `markRead` | Not implemented. No `send` until Phase 2. |
| `ProfileRepository` | `getMe`, `updatePhone` | Not implemented. |
| `SessionRepository` | `listMine`, `revoke` | `user_sessions` exists in the database. No list or revoke-other endpoint exists. |

Query keys include `staffId` and `academicYearId`. They never include a selected child.

Pagination defaults: students and attendance history **25**, homework **10**, messages **12**, matching the UI spec.

---

## 6. Auth, roles, and navigation guards

Teacher sign-in is a separate flow from the parent Firebase login and from the admin password login.

### Mock session (default)

`AuthRepository.login` checks the fixture teacher only:

| Email | Password | Result |
| --- | --- | --- |
| `meera.iyer@spdf.school` | `password123` | Mock `TeacherSession`, role `TEACHER`, phase from `NEXT_PUBLIC_PORTAL_PHASE` |
| Any other pair | | `PortalError` `INVALID_CREDENTIALS` |

The password is a local fixture so engineers can open the shell. It is not a school account and it is not sent to `/api/v1/auth/login`.

Remember me stores the mock session in `localStorage` under `spdf.teacher.session`. Without it, the session stays in `sessionStorage`. Logout clears both. This storage is a review stand-in. It is not an access token and not a refresh token.

A second fixture email `admin@spdf.school` and `parent@spdf.school` always fail with `NOT_A_TEACHER`, so the UI can show: **This sign-in is for teachers. Use the portal your school gave you.**

### Guards

Client guards match the parent pattern (`GuestGuard`, `AuthGuard`) and are a UX gate only. They are not the security boundary.

| Guard | Behavior |
| --- | --- |
| `GuestGuard` | Signed-in teacher on `/login` goes to `/app`. |
| `AuthGuard` | Missing session goes to `/login?next=` with the in-portal path encoded. `next` must start with `/app`. Other values are ignored. |
| `PhaseGuard` | Route `minPhase` above the configured phase renders the permission empty state. The page does not flash student data. |
| `PermissionGuard` | Missing permission code renders the same empty state. |

`middleware.ts` can only check that a session cookie exists if one is added later. It must not trust a role or a class id written by the browser. Until the teacher API issues an httpOnly cookie, middleware stays a light redirect for a missing mock cookie, and screens still call `AuthGuard`.

### Permissions

Codes are the proposed list in `TEACHER_PORTAL_MODULES.md` section 28. The mock session for Phase 1 carries the Phase 1 codes only. The sidebar and in-page buttons hide actions the code does not allow. The mock repository returns `FORBIDDEN` if a hidden action is invoked anyway.

Phase map:

| Phase value | Reachable |
| --- | --- |
| `1` | Teaching day routes |
| `2` | Phase 1 plus leave, lessons, syllabus, exams, resources, message compose |
| `3` | Phase 2 plus `/app/reports` |

Default environment value is `1`.

---

## 7. Forms, errors, accessibility, responsive layout

### Validation

Use `zod` 4 and `react-hook-form` with `@hookform/resolvers` for every form, including login. Schemas live in `src/features/<module>/schema.ts`.

| Form | Rules |
| --- | --- |
| Login | Email format. Password length 8–128, matching the existing auth schema’s length limits. |
| Forgot password | Email format. Until a reset API exists, submit resolves to the unavailable state from the UI spec. It does not show a false “email sent” success. |
| Phone | Optional string, school-defined max 40. |
| Homework | Title required, max 200. Class, section, and subject required and limited to loaded assignments. |
| Attendance remark | Max 500 characters, the column width on `attendance_records`. |
| Password change | Current password required. New password 8–128. Confirmation must match. |
| Marks and leave | Phase 2 schemas. Absent is a status, not a coerced zero. |

Inline errors use the `Input` error slot. Focus moves to the first invalid field. The primary button disables while the mutation is pending.

### Errors

`src/lib/api/errors.ts` defines `PortalError` with `code` and `message`.

| Situation | UI |
| --- | --- |
| Query failed | `ErrorState` and **Retry**. Message is the portal sentence, never a stack or a SQL fragment. |
| Mutation failed | `sonner` error toast. The form stays editable. |
| `FORBIDDEN` or out of scope | Permission empty state from the UI spec. Same sentence whether the row is missing or hidden. |
| `API_NOT_READY` | **This action is not available yet.** |
| 401 from a future API | Clear the session and return to `/login`. |

A future `apiFetch` parses the documented `{ success: false, error }` body. Unknown 500 bodies become **Something went wrong. Please try again.**

### Accessibility and responsive layout

Follow `TEACHER_DASHBOARD_UI.md` sections 17 and 18.

- Skip link, focus ring, `aria-expanded` on the menu, `aria-pressed` on attendance segments.
- Status is a word plus a badge color.
- Targets on the register, drawer, and save bar are at least 44px.
- Under `md` (768px) the sidebar is a drawer. From `lg` (1024px) the dashboard uses two columns.
- `prefers-reduced-motion` is already the pattern in the parent global CSS. Copy that block. Do not animate glass entrance on these pages.

---

## 8. Dependencies

Install into **this** project only, at versions npm resolves for React 19.3. The parent package.json is the compatibility reference (October 2026 ranges below).

```bash
npm install \
  @tanstack/react-query \
  class-variance-authority \
  clsx \
  tailwind-merge \
  lucide-react \
  next-themes \
  react-hook-form \
  @hookform/resolvers \
  zod \
  sonner \
  zustand \
  date-fns
```

Parent ranges at the time of writing: Query `^5.102.8`, `cva` `^0.7.1`, `clsx` `^2.1.1`, `tailwind-merge` `^3.6.0`, `lucide-react` `^1.43.0`, `next-themes` `^0.4.6`, `react-hook-form` `^7.87.0`, `@hookform/resolvers` `^5.9.1`, `zod` `^4.5.4`, `sonner` `^2.0.8`, `zustand` `^5.0.15`, `date-fns` `^4.4.0`.

Do not add:

| Package | Reason |
| --- | --- |
| `firebase` | Parent sign-in. Teachers do not use `/api/v1/auth/firebase`. |
| `leaflet`, `react-leaflet` | Parent transport map. |
| `axios` | Parent portal uses repositories, not Axios. A small `fetch` wrapper is enough when an API exists. |
| Component kits (MUI, Chakra, Ant Design, shadcn CLI) | The Client UI primitives are the kit. |
| `redux`, `moment`, `styled-components` | Not used by the Client UI. |
| `@tailwindcss/postcss` | This app already compiles Tailwind with `@tailwindcss/turbopack`. |

Zustand store key: `spdf.teacher.ui`. Do not reuse `spdf.parent.selected-child`.

---

## 9. Environment and commands

### `.env.example`

```bash
# mock (default) uses local fixtures. api refuses calls until teacher endpoints exist.
NEXT_PUBLIC_DATA_SOURCE=mock

# Empty until a teacher API base is agreed. Not used in mock mode.
NEXT_PUBLIC_API_BASE_URL=

# 1 = teaching day, 2 = academic cycle, 3 = reports. See TEACHER_PORTAL_MODULES.md.
NEXT_PUBLIC_PORTAL_PHASE=1

NEXT_PUBLIC_APP_NAME=SPDF Teachers Portal
```

No `NEXT_PUBLIC_FIREBASE_*` variables. No `NEXT_PUBLIC_ENABLE_DEMO_AUTH`. The fixture account is documented in section 6 and is active only when `NEXT_PUBLIC_DATA_SOURCE=mock`.

`.env.local` is gitignored by the existing `.gitignore` (`*.local`). Commit `.env.example` only.

`src/config/app.ts` reads these values. `getDataSource()` returns `"mock"` unless the variable is exactly `"api"`. `getPortalPhase()` returns `1` unless the variable is `2` or `3`.

### Commands

From `TeachersPortal/teachers-portal`:

```bash
npm install
cp .env.example .env.local
npm run dev -- -p 3001
npm run lint
npm run build
```

Node.js 20 or newer. npm 10 or newer. Same baseline as the Client UI getting-started note.

`npm run build` must pass with `NEXT_PUBLIC_DATA_SOURCE=mock` and with `api`. In `api` mode, pages render the unavailable and permission states. They do not fetch fixtures and they do not call admin login.

---

## 10. Pending API requirements

Nothing in this table is implemented on the backend today. Names are requirements for a later contract. They are not routes this frontend may call.

| Need | Why it is pending |
| --- | --- |
| Teacher login that returns a teacher session and rejects non-teachers | `POST /api/v1/auth/login` is documented for admins. `POST /api/v1/auth/firebase` is documented for parents. |
| Teacher logout and refresh that cannot unlock the Admin Portal | Existing refresh and logout take a refresh token from the admin session flow. A teacher session does not exist yet. |
| Current teacher profile (`staff` linked to `users`) | No staff read endpoint. |
| Teaching load, timetable, students in scope | No academic endpoints. Scope rules are in `TEACHER_PORTAL_MODULES.md` section 5. |
| Attendance read, and write only for a class teacher | No attendance endpoint. Class-teacher assignment is a schema gap, so the UI stays view-only. |
| Homework list, save, publish, feedback | Tables exist. No API. |
| Inbox list and mark-read | Tables exist. No API. |
| Change password, forgot password, list sessions, revoke other sessions | Not in `auth.routes.ts`. |
| File attach for homework and profile photos | Upload routes exist and allow images and PDF. They are not authorized for a teacher session. Do not call them until that authorization is specified. |
| Phase 2: leave, lessons, syllabus, marks, resources, class send | Schema gaps called out in the module document, plus missing APIs. |

When a route is added later, the matching `src/repositories/api/*` class implements the existing interface and the factory stops throwing for that method only.

---

## 11. Assumptions

1. This workspace is the only Teachers Portal codebase. The parent Client UI remains the visual reference and is not imported at build time.
2. Phase 1 ships against mocks. Switching `NEXT_PUBLIC_DATA_SOURCE` to `api` is a deliberate failure mode until section 10 is filled in.
3. One teacher role, `TEACHER`. A person who is also an administrator uses the Admin Portal in a separate session.
4. The school does not choose another tenant inside this UI. `schoolId` comes from the session.
5. Academic year on the header is a view filter. The mock exposes `2026–27` only.
6. Guardian phone and email stay off the student profile.
7. English UI copy. Status labels that the school will own later (attendance, leave types, grades) are plain strings on the fixtures for now.
8. The create-next-app page, Geist fonts, and default CSS are replaced in the first implementation pass. This document does not replace them.
9. `cacheComponents` stays on. Authenticated pages that depend on the session are client components until a teacher cookie design exists. Do not cache a teacher’s class list as if it were public.

---

## 12. First implementation pass (not started)

When implementation is requested, the order is:

1. Add the dependencies in section 8 and `.env.example`. Point `@/*` at `./src/*`. Move the App Router under `src/app` without changing behavior beyond a redirect from `/` to `/login`.
2. Copy tokens, `cn`, theme provider, and the listed primitives. Set Plus Jakarta Sans.
3. Add mock auth, guards, and the shell with Phase 1 navigation. Login page per the UI spec. No dashboard widgets yet.
4. Add repository interfaces and mocks for the home snapshot only after the shell is reviewed.

That sequence is a plan. This file does not apply it.
