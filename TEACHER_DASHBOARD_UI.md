# Teachers Portal — UI Specification

**Status:** Design specification only. No application code.  
**Date:** 21 October 2026  
**Source of truth:** `TEACHER_PORTAL_MODULES.md`  
**Visual source:** School ERP Client UI at `ERPWEB/ERPCLIENTWEB` (SPDF Parent Portal)  
**This portal:** a teacher-facing application. It shares the Client UI’s type, color, spacing, and controls. It does not share the parent information architecture, and it is not a reduced Admin Portal.

Sample names, counts, and timetable rows in this document are **design fixtures**. They describe how a screen should look in review. They are not live school data, not API responses, and not seed records to ship.

---

## 1. What was inspected

The Client UI is a Next.js parent portal. Authenticated screens use repositories. The default data source is mock. Production teacher screens must not import those parent mocks and must not render the fixtures in this document as if the teacher API had returned them.

| Client UI piece | Path | What the teacher portal keeps |
| --- | --- | --- |
| Tokens | `src/styles/tokens.css` | Indigo brand, teal accent, warm stone surfaces, status pairs, radii, sidebar and header sizes, shadows. Light, dark, and system. |
| Type | `src/app/layout.tsx` | Plus Jakarta Sans as the only UI face. |
| Global CSS | `src/app/globals.css` | Semantic Tailwind colors, focus ring, reduced motion. |
| Login | `src/app/(auth)/login/page.tsx`, `src/features/auth/LoginForm.tsx` | Split canvas, card, fields, show-password, remember me, forgot-password link, full-width primary button. |
| Forgot password | `src/app/(auth)/forgot-password/page.tsx` | Centered card, same type scale, success copy that does not reveal whether the email exists. |
| Shell | `src/app/(portal)/app/layout.tsx`, `Sidebar.tsx`, `Header.tsx` | Sticky sidebar, collapse, mobile drawer, 4rem header, school name, avatar menu. |
| Page frame | `PageContainer` | `max-w-7xl`, title `text-2xl`, description `text-sm text-muted-foreground`, actions on the right from `sm`. |
| Controls | `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Dropdown`, `EmptyState`, `ErrorState`, `Skeleton` | Same variants, heights, and empty/error pattern. |
| Lists | Assignments and Updates pages | Search debounced at 300ms, filter chips, page reset on filter change, toast on success. |
| Dashboard rhythm | `DashboardPage.tsx` | Mobile is one column. From `lg`, a wide column and a narrow column. Cards are solid, not glass. |
| Settings | `SettingsPage.tsx` | Light / Dark / System as three selectable tiles. |
| Feedback | `sonner` toasts | Success and error toasts. No toast for a routine navigation. |

Parent-only patterns that stay in the parent portal:

| Parent pattern | Why it is absent here |
| --- | --- |
| Child selector | A teacher has classes, not a selected child. |
| Fee stat and rupee icon | Fees are Admin Portal and parent portal concerns. |
| Google sign-in | Parent Firebase path. Teachers sign in with school email and password. |
| Profile tabs for guardians, transport, and health | Those are a child’s record. The teacher profile is an employment record. |
| Leave dialog on the attendance page | Parent leave is a family request. Teacher leave is a separate staff workflow. |
| Gallery, library, transport, news publishing | Out of the teacher module list. |

Admin Portal navigation (admissions, users, fee setup, hostel, inventory) is not restyled into this sidebar.

---

## 2. Visual foundation

Use the Client UI tokens. Do not introduce a second palette.

| Token | Light value | Use |
| --- | --- | --- |
| `--brand` | `#4f46e5` | Primary actions, active nav, links |
| `--accent` | `#0d9488` | Secondary emphasis only (a “next period” marker). Not a second primary button color. |
| `--background` | `#f7f5f2` | App canvas |
| `--foreground` | `#1c1917` | Text |
| `--card` | `#ffffff` | Panels |
| `--muted` | `#efebe6` | Hover, skeleton, secondary buttons |
| `--muted-foreground` | `#78716c` | Help text |
| `--border` | `#e7e0d8` | Hairlines |
| `--radius` | `0.75rem` | Cards. Buttons and inputs use `rounded-lg`. |
| `--sidebar-width` | `16.5rem` | Expanded sidebar |
| `--sidebar-collapsed` | `4.5rem` | Collapsed sidebar |
| `--header-height` | `4rem` | Header and sidebar brand row |

Status always pairs a word with a color. Color alone is never the status.

| Status | Badge variant | Typical label |
| --- | --- | --- |
| Success | `success` | Present, Published, Approved, Saved |
| Warning | `warning` | Late, Due soon, Pending |
| Danger | `danger` | Absent, Rejected, Overdue |
| Info | `info` | Excused, Holiday, Submitted for review |
| Neutral | `default` | Draft, Not marked, Closed |

Spacing follows the parent shell: main padding `px-4 py-6 md:px-6`, card padding `p-5`, stack gap `gap-4` on dashboards and `space-y-6` on standard pages. Touch targets are at least 44px (`h-11`) on mobile for status buttons, the menu, and the save bar.

Glass tilt (`glass-tilt-card`) is a parent decorative utility. Teaching screens use solid `Card`. A marks grid or attendance register under a blur is harder to scan and is out of this design.

Dark mode uses the existing `.dark` tokens. Every screen in this document must be checked in light and dark. Appearance lives in Settings, default **System**, matching the parent portal.

---

## 3. Product chrome

**Name in the UI:** SPDF Teachers Portal.  
**Short mark:** SPDF ERP, with the line “Teachers Portal”.  
**Collapsed sidebar mark:** the letter **S** in brand color. Do not copy the parent sidebar’s collapsed letter.

**Phase visibility.** The module document hides later work until its API exists. This specification draws those screens so the language stays consistent, and it keeps them out of the Phase 1 navigation.

| Phase | In the sidebar |
| --- | --- |
| 1 — Teaching day | Home, My day, My classes, Students, Attendance, Homework, Calendar, Messages, Profile, Settings |
| 2 — Academic cycle | Leave, Lessons, Examinations, Resources, plus Compose inside Messages |
| 3 — Insight | My reports |

A hidden route that is opened directly shows the permission-denied state in Section 16, not a half-built page.

---

## 4. Login

### Purpose

Let a teacher enter the portal with the same calm sign-in the parent already trusts, with teacher copy and teacher authentication rules.

### Layout

Same structure as `login/page.tsx`.

| Region | Desktop (`lg` and up) | Below `lg` |
| --- | --- | --- |
| Left panel | Half the viewport. Hidden below `lg`. | Omitted. |
| Right panel | Centers a `max-w-md` card on `bg-background`. | The card is the whole page, with `px-4 py-10`. |

**Left panel.** The parent gradient stays:

`radial indigo at top left, radial teal at bottom right, linear #1e1b4b to #312e81`.

White type. Eyebrow `text-sm font-semibold tracking-[0.2em] uppercase` reading **SPDF ERP**. Headline `text-4xl font-semibold` :

> Your classes, your day, in one place.

Supporting line `text-base text-indigo-100`, max width `28rem`:

> See today’s periods, the students you teach, and the work still open — without the admin console.

Foot card: `rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur`.

> Built for teachers  
> Assigned classes only · School-managed accounts · Separate from the Admin Portal

**Right card.** `rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8`.

- Eyebrow: **SPDF Teachers Portal** in `text-brand`.
- Title: **Welcome back** (`text-2xl font-semibold tracking-tight`).
- Line: **Sign in with your school email.**

### Components and fields

Reuse `LoginForm` structure, `Input`, and `Button`.

| Field | Component | Rules |
| --- | --- | --- |
| Email address | `Input`, `type="email"`, `autoComplete="email"`, required | Placeholder `you@school.edu`. Never prefilled. |
| Password | `Input`, `autoComplete="current-password"`, required | Show / hide button with `Eye` / `EyeOff`, `aria-label` “Show password” / “Hide password”. Minimum 8 characters, matching the API schema. |
| Remember me | Native checkbox, `size-4 rounded border-input` | Default checked, as in the parent form. |
| Forgot password? | Brand link to `/forgot-password` | Same placement, right of the checkbox row. |
| Sign in | `Button` `className="w-full"` | Label **Sign in**. While the request runs: **Signing in…** and the button is disabled. |

There is no “OR” divider and no **Continue with Google**. That control belongs to the parent Firebase flow.

Helper line, centered, `text-xs text-muted-foreground`:

> Need a login? Ask your school administrator. This portal cannot create accounts.

### Actions and navigation

| Action | Result |
| --- | --- |
| Valid teacher sign-in | Toast **Welcome back**. Replace the route with `/app`, or with `next` when it is an in-portal path. |
| Admin account, parent account, or user with no active staff profile | Stay on the card. Toast and inline error: **This sign-in is for teachers. Use the portal your school gave you.** Do not redirect into the Admin Portal or the parent portal. |
| Unknown email or wrong password | **Email or password is incorrect.** One message for both cases. |
| Too many attempts | **Too many attempts. Wait a moment and try again.** |
| Network or 500 | **Unable to sign in. Please try again.** |

### Forgot password

Same centered card as the parent forgot-password page. Title **Reset password**. Body: **We will email you a secure link to choose a new password.** One email field. Primary **Send reset link**. After submit, the parent success pattern:

> If an account exists for {email}, you will receive reset instructions shortly.

**Back to sign in** returns to `/login`. The API for this flow is not built yet (`TEACHER_PORTAL_MODULES.md`, Module 15). The screen is specified now. Until the endpoint exists, the form shows the error state **Password reset is not available yet. Contact your school administrator.** It must not pretend an email was sent.

### Responsive behavior

Below `lg`, the brand story is the eyebrow and the card title. No horizontal scroll. The card is full width up to `28rem`.

### Data

No fixture credentials on the form. A design review may use a throwaway account outside the UI. Do not add the parent demo banner (`Demo auth is active. Use …`).

---

## 5. Application shell

### Purpose

Keep the teacher inside one school, one role, and a short list of teaching jobs.

### Layout

```text
┌──────────────┬──────────────────────────────────────────┐
│ Sidebar      │ Header (school, year, account)           │
│ 16.5rem      ├──────────────────────────────────────────┤
│ sticky       │ Main  px-4 py-6 md:px-6                  │
│ h-dvh        │ content max-w-7xl centered               │
└──────────────┴──────────────────────────────────────────┘
```

Background `bg-background`. Sidebar `bg-card` with `border-r`. Header `sticky top-0 z-30 h-16 border-b bg-card/90 backdrop-blur`.

### Sidebar

Same interaction as `Sidebar.tsx`: desktop from `md`, drawer below `md`.

**Brand row.** Expanded: **SPDF ERP** / **Teachers Portal**. Collapsed: **S**, and a button labelled **Expand sidebar** or **Collapse sidebar** (`PanelLeftOpen` / `PanelLeftClose`).

**Groups and items.** Section labels are `text-[11px] font-semibold uppercase tracking-wide text-muted-foreground`.

| Group | Item | Icon | Route | Phase |
| --- | --- | --- | --- | --- |
| Teaching | Home | `Home` | `/app` | 1 |
| Teaching | My day | `CalendarClock` | `/app/day` | 1 |
| Teaching | My classes | `BookOpen` | `/app/classes` | 1 |
| Teaching | Students | `GraduationCap` | `/app/students` | 1 |
| Teaching | Attendance | `CalendarCheck` | `/app/attendance` | 1 |
| Teaching | Homework | `NotebookPen` | `/app/homework` | 1 |
| Teaching | Calendar | `CalendarDays` | `/app/calendar` | 1 |
| Teaching | Leave | `Briefcase` | `/app/leave` | 2 |
| Teaching | Lessons | `BookMarked` | `/app/lessons` | 2 |
| Teaching | Examinations | `ClipboardCheck` | `/app/exams` | 2 |
| Teaching | Resources | `FolderOpen` | `/app/resources` | 2 |
| School | Messages | `MessageSquare` | `/app/messages` | 1 |
| Account | My reports | `BarChart3` | `/app/reports` | 3 |
| Account | Profile | `UserRound` | `/app/profile` | 1 |
| Account | Settings | `Settings` | `/app/settings` | 1 |

Active item: `bg-brand-muted font-medium text-brand`. Inactive: `text-muted-foreground`, hover `bg-muted`. Home is active only on an exact `/app` match. Other items use a path prefix, as the parent sidebar does.

Messages shows a numeric badge when unread count is greater than zero. Cap the display at **9+**. The badge is text plus color (`Badge` `variant="danger"`), including in the collapsed sidebar as a dot with `aria-label` “3 unread messages”.

Phase 2 and 3 items are omitted from the DOM until that phase is enabled for the school. They are not shown with a “Soon” badge. The parent “Soon” badge is for unfinished parent modules. A teacher should not see a menu of work they cannot do.

**Mobile drawer.** `fixed inset-0 z-50`, scrim `bg-black/40`, panel `w-[min(18rem,85vw)]`. Close on scrim, on the X button, and after a navigation. Focus moves to the close button when the drawer opens and returns to the menu button when it closes.

### Header

| Slot | Content |
| --- | --- |
| Menu | `md:hidden`. Bordered `h-10 w-10` button, `Menu` icon, label **Open navigation**. |
| Title | School name, `text-sm font-semibold md:text-base`, truncated. Design fixture: **SPDF International School**. |
| Subtitle | `hidden sm:block text-xs text-muted-foreground`. **Wednesday, 21 October 2026 · School local time**. |
| Year | Read-only chip, not a school switcher. **2026–27**. If the school has opened earlier years for viewing, this becomes the parent `Dropdown` (`AcademicSessionSelect` visual, teacher data). Changing year never reveals students outside that year’s teaching rows. The teacher cannot create or close a year. |
| Account | Avatar button: photo or initials, name hidden below `md`, visible `md` and up, max width `8rem`. |

The parent header’s child selector and help-icon-to-settings shortcut are omitted. Profile and Settings are already in the account menu and the sidebar.

**Account menu.** `role="menu"`, `absolute right-0 mt-2 w-52 rounded-xl border bg-popover p-1 shadow-md`.

| Item | Destination |
| --- | --- |
| My Profile | `/app/profile` |
| Settings | `/app/settings` |
| Logout | Ends the session, then `/login`. Text `text-danger`, hover `bg-danger-muted`. |

Logout asks for confirmation only when a register or marks grid has unsaved edits. Otherwise it signs out immediately, matching the parent menu.

### Responsive behavior

| Width | Shell |
| --- | --- |
| Under `md` (768px) | No persistent sidebar. Drawer. Header shows menu, school, year chip, avatar without name. |
| `md` to `lg` | Sidebar expanded by default. User may collapse it. Main content keeps `max-w-7xl`. |
| `lg` and up | Same shell. Dashboard uses two columns inside the main area. |

Collapse state persists for the browser, the same way the parent UI store keeps `sidebarCollapsed`.

---

## 6. Teacher dashboard

### Purpose

Answer, in order: what period is next, which class it is, what is still unmarked, and what the school has sent.

### Layout

`mx-auto w-full max-w-7xl space-y-4`, matching `DashboardPage`.

**Mobile (under `lg`) — one column, this order:**

1. Welcome
2. Now / next period
3. Pending-task counts
4. Today’s timetable
5. Assigned classes
6. Attendance summary
7. Announcements
8. Upcoming exams (Phase 2 only; the block is absent in Phase 1)

**Desktop (`lg` and up):**

```text
Welcome (full width)
Now / next period (full width)
Pending-task counts (full width, 3 cards)

┌─────────────────────────────┬──────────────────────┐
│ Today’s timetable           │ Assigned classes     │
│ Pending tasks list          │ Attendance summary   │
│                             │ Announcements        │
│                             │ Upcoming exams (Ph2) │
└─────────────────────────────┴──────────────────────┘
```

Column ratio `lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.85fr)]`, the same split the parent dashboard uses, so a tall right card does not open a hole in the left stack. Each column is its own vertical stack (`gap-4`).

### 6.1 Welcome

Not a second profile card. The parent dashboard greets the child. This page greets the teacher.

| Element | Spec |
| --- | --- |
| Heading | `{Time of day}, Meera` — `text-xl sm:text-2xl font-semibold tracking-tight`. Time-of-day helper is the same idea as `getTimeOfDayGreeting`. |
| Line | `text-sm text-muted-foreground`. **Mathematics · 4 classes today · Academic year 2026–27**. |
| No avatar here | The header already shows the teacher. A second avatar competes with the period card. |

Design fixture person: **Meera Iyer**, designation **Mathematics Teacher**, employee number **T-0142**. Fixture only.

### 6.2 Now / next period

A full-width status card in the manner of `TodayStatusCard`: icon tile, eyebrow, headline, detail, one action.

| State | Eyebrow | Headline example | Action |
| --- | --- | --- | --- |
| In a period | **Now · Period 2** | Grade 8 · Section A · Mathematics | **Open class** |
| Before the next period | **Next · Period 3 · 10:05** | Grade 7 · Section B · Mathematics | **Open class** |
| Day finished | **Today · Finished** | No further periods today. | **View my day** |
| Holiday | **Today · Holiday** | Gandhi Jayanti. The school is closed. | **View calendar** |
| No timetable published | **Today · No periods** | Your timetable has not been published. | None. The action is hidden. |

The card uses a tinted border the way `TodayStatusCard` does: accent-tinted for the live period, info-tinted for a holiday, neutral for an empty day. The action is an outline button, full width on small screens and `sm:w-auto` beside the text.

**Open class** goes to `/app/classes/{assignment}` for that period’s class, section, and subject.

### 6.3 Pending tasks

Three stat cards, not four. The parent row’s fee card is not replaced with another vanity number.

| Card | Fixture value | Tone | Destination |
| --- | --- | --- | --- |
| Attendance still open | **1 section** | warning | `/app/attendance?date=2026-10-21` |
| Homework to review | **12 submissions** | brand | `/app/homework?status=needs-review` |
| Unread messages | **3** | info | `/app/messages?unread=1` |

Each card is a link, icon in a tinted square, label `text-xs text-muted-foreground`, value `text-xl font-semibold`. If a count is zero, the value reads **Clear** and the card stays visible so the teacher can see that nothing is waiting.

When the signed-in teacher is not a class teacher, the attendance card reads **View only** and links to the history. It does not say “1 section” .

Until a class-teacher assignment exists in the API, this card uses the view-only wording for every teacher. The fixture in Section 19 shows the class-teacher wording so the intended layout can be reviewed. The caption under the fixture says the designation is not in the database yet.

### 6.4 Today’s timetable

`Card` with `SectionHeader` title **Today’s timetable** and a **View all** link to `/app/day`.

Rows, not a week grid. A week grid belongs on My day.

| Period | Time | Class | Room | State |
| --- | --- | --- | --- | --- |
| 1 | 08:30–09:15 | Grade 8 A · Mathematics | 12 | Done |
| 2 | 09:20–10:05 | Grade 8 A · Mathematics | 12 | Now |
| 3 | 10:20–11:05 | Grade 7 B · Mathematics | 14 | Upcoming |
| 6 | 13:10–13:55 | Grade 8 B · Mathematics | 12 | Upcoming |

The current row has a 3px accent bar on the left and the word **Now**. Done rows are `text-muted-foreground`. Tapping a row opens that class card.

Empty: **No periods on this date.** Link **See the week**.

### 6.5 Assigned classes

Right column. `SectionHeader` **Assigned classes**, link **View all** → `/app/classes`.

Each row: class and section, subject, **Lead** badge when `is_primary` is true, student count, and a class-teacher badge only when that designation exists.

Fixture rows:

| Class | Subject | Students | Badges |
| --- | --- | --- | --- |
| Grade 8 · Section A | Mathematics | 32 | Lead · Class teacher |
| Grade 8 · Section B | Mathematics | 30 | Lead |
| Grade 7 · Section B | Mathematics | 28 | Lead |
| Grade 6 · Section A | Mathematics | 31 | Co-teacher |

**Class teacher** is a design of the intended badge. In Phase 1, before the schema exists, omit the badge rather than inventing the duty.

### 6.6 Attendance summary

Right column, under classes. Visible in Phase 1 as a view.

| Viewer | Content |
| --- | --- |
| Class teacher, today unmarked | **Grade 8 A** · **Not marked** · button **Mark attendance** |
| Class teacher, saved | **32 present · 1 absent · 1 late** · **Edit** while the window is open, otherwise **View** |
| Subject teacher | **Grade 8 A this month · 94% present** · **View history**. No mark button. |
| No class-teacher data in the API | One line: **Daily attendance is marked by the class teacher. Your school has not assigned that duty in the teacher portal yet.** Link **View history**. |

Do not show a school-wide absentee count.

### 6.7 Announcements

`SectionHeader` **Announcements**, link **View all** → `/app/messages`. Up to three items: unread dot, title, relative time.

Fixture:

| Title | Time | State |
| --- | --- | --- |
| Staff meeting moved to Thursday | 2 hours ago | Unread |
| Grade 8 excursion consent | Yesterday | Unread |
| Fire drill at 11:40 | Monday | Read |

Empty: **No announcements.**

### 6.8 Upcoming exams

Phase 2. Absent from the Phase 1 dashboard so the page does not advertise a marks book that cannot be opened.

When Phase 2 is on, the card lists sittings inside the teacher’s subjects only.

| Exam | Paper | When |
| --- | --- | --- |
| Term 1 | Grade 8 A · Mathematics | Mon 2 Nov · 09:00 · Hall B |
| Term 1 | Grade 7 B · Mathematics | Tue 3 Nov · 09:00 · Hall B |

Link **Open examinations**. If marks entry is open, a warning badge **Entry open** sits on that row.

### Dashboard actions

Every widget click is a navigation. The dashboard does not mark attendance, publish homework, or send a message inline. Those actions need their own screens and a saved state.

### Empty scope

If the account is a teacher and the active year has no teaching rows, replace widgets 2–8 with one `EmptyState`:

> **No classes assigned yet**  
> Your school has not assigned classes for 2026–27. You can still read messages and update your profile.

Actions: **Messages**, **Profile**. No school-wide directory behind the empty state.

---

## 7. My day and timetable

### Purpose

Show the teacher’s own periods for a date and for the week. The timetable is read-only. Substitutions are Phase 2 and are not drawn as an editor.

### My day — `/app/day`

`PageContainer` title **My day**, description **Periods published for you**.

**Toolbar:** previous day, date label **Wednesday, 21 October 2026**, next day. The teacher can move from today through the next five teaching days and back through the current week. Further range is not required in Phase 1.

**Body:** a single column of period cards.

| Field | Example |
| --- | --- |
| Period and time | Period 2 · 09:20–10:05 |
| Class, section, subject | Grade 8 · Section A · Mathematics |
| Room | Room 12 |
| Actions | **Students**, **Homework** |

A holiday replaces the list with an info `Card`: holiday name and **The school is closed.**

**View week** sits in the page actions and goes to `/app/timetable`.

### Week timetable — `/app/timetable`

`PageContainer` title **Timetable**, description **Your published week. Changes are made by the school.**

Desktop (`lg`): seven columns if the school week includes Saturday, otherwise Monday–Friday. Column header is the weekday. Cells show time, class section, subject, room. The current period, when the visible week is this week, uses the accent bar.

The fixture week for Meera (Monday–Friday, school-local times):

|  | Mon | Tue | Wed | Thu | Fri |
| --- | --- | --- | --- | --- | --- |
| P1 08:30 | 8A Maths · 12 | 7B Maths · 14 | 8A Maths · 12 | 6A Maths · 11 | 8B Maths · 12 |
| P2 09:20 | 8B Maths · 12 | 8A Maths · 12 | 8A Maths · 12 | 8A Maths · 12 | 7B Maths · 14 |
| P3 10:20 | 7B Maths · 14 | — | 7B Maths · 14 | 8B Maths · 12 | — |
| P6 13:10 | — | 6A Maths · 11 | 8B Maths · 12 | — | 8A Maths · 12 |

An em dash is a free slot. The UI does not label it as a duty.

Tablet and mobile: the grid becomes the same day list as My day, with a weekday scroller (horizontal chips, each chip `min-h-11`). Do not shrink the grid until text overflows.

**Section timetable.** From a class card, **Section week** opens a read-only week for that section. Other teachers appear as names only (**Science · A. Rao**). Their homework and marks are not linked.

There is no drag handle, no room editor, and no **Publish** button.

### Calendar — `/app/calendar`

Phase 1 read-only month, using the parent attendance-calendar interaction (month chevrons, day cell, select a day) without the parent’s leave-apply button.

Day cells can show:

- Holiday (info dot and name)
- Own period count
- Phase 2: an exam dot when a sitting matches the teacher’s subject

Selecting a day opens My day for that date. The teacher cannot add events.

---

## 8. My classes, subjects, and departments

### Purpose

Show the teaching load the school assigned. The teacher does not create classes, subjects, or departments.

### My classes — `/app/classes`

`PageContainer` title **My classes**, description **Classes and subjects assigned to you for 2026–27.**

**Toolbar:** search (class, section, or subject), and a subject `Dropdown`. Search is debounced 300ms, same as the parent assignment list.

**Results:** cards, one per teaching row. Not an admin table with edit and delete.

Card content:

| Field | Fixture |
| --- | --- |
| Title | Grade 8 · Section A |
| Subject | Mathematics |
| Meta | 32 students · 6 periods this week |
| Badges | Lead teacher |
| Actions | **Students**, **Timetable**, **Homework** |

**Students** opens `/app/students?class=8&section=A`.  
**Timetable** opens the section week.  
**Homework** opens `/app/homework?class=8&section=A&subject=math`.

Empty search: **No class matches that filter.** **Clear filters** resets the toolbar.

Empty load: the dashboard empty-scope message.

### Class detail — `/app/classes/{id}`

Header: **Grade 8 · Section A**, description **Mathematics · You are the lead teacher for this subject.**

A row of quiet links, not admin tabs that imply ownership of the whole class:

| Link | Goes to |
| --- | --- |
| Roll | Student list filtered to this section |
| This week | Section timetable |
| Homework | Tasks for this class-subject |
| Attendance | History for this section. **Mark** appears only for the class teacher inside the edit window. |
| Marks | Phase 2. Hidden in Phase 1. |

Body: next period, student count, last attendance date the teacher is allowed to see, count of open homework. No capacity editor, no rename, no remove-teacher action.

### Departments

Departments are context, not a module the teacher manages.

On **Profile**, a read-only block **Departments** lists membership.

Fixture: **Mathematics** with badge **Primary**. A second line is omitted unless the staff record has one.

There is no `/app/departments` management screen, no head-of-department student list, and no **Add department** action. A department name does not widen the student list.

### Subjects

Subjects appear as the second line of each class card and as a filter. There is no subject catalogue page. The teacher cannot change subject type or code.

---

## 9. Students

### Purpose

Find a student the teacher actually teaches, and open a classroom profile that omits fees, health files, and admission documents.

### List — `/app/students`

`PageContainer` title **Students**, description **Students in your classes for 2026–27.**

**Search.** One `Input` with a leading `Search` icon. Placeholder **Search by name or roll number**. Debounce 300ms. Resets to page 1.

**Filters.** Horizontal chips, wrapping, each at least 44px tall:

- Class: All, Grade 6, Grade 7, Grade 8 (only grades in the teaching load)
- Section: depends on the class chip
- Subject: only the teacher’s subjects

Active filters also appear as removable chips under the bar, the same pattern as `AssignmentsPage`. **Clear all** shows when any filter is set.

Changing a filter never adds a class the teacher does not teach. If the URL contains another section, the page shows the permission state, not that section’s names.

**List.** Page size **25**. Footer: **Showing 1–25 of 32** with Previous and Next. Disable the ends. On mobile the row is a card; from `md` it is a simple table without column customization.

| Column | Content |
| --- | --- |
| Student | Avatar initials, name |
| Roll | Roll number |
| Class | Grade 8 · A |
| This month | Present percent for that section, with the words **94% present** |
| Open homework | Count in this teacher’s subjects only |

Fixture page (not a full roll):

| Name | Roll | Class | Attendance | Open homework |
| --- | --- | --- | --- | --- |
| Aanya Shah | 08 | Grade 8 · A | 96% present | 0 |
| Kabir Menon | 14 | Grade 8 · A | 88% present | 2 |
| Diya Nair | 19 | Grade 8 · A | 91% present | 1 |
| Arjun Patel | 03 | Grade 7 · B | 97% present | 0 |
| Sara Iqbal | 11 | Grade 7 · B | 84% present | 1 |
| Noah D’Souza | 22 | Grade 8 · B | 93% present | 0 |

Row click opens `/app/students/{id}`.

A search that matches nobody in scope, including a real student who is taught by someone else, shows:

> **No student found**  
> Check the name or roll number. You only see students in your classes.

No “did you mean” result from outside the scope.

Export is off in Phase 1. No export button.

### Student detail — `/app/students/{id}`

`PageContainer` title is the student name. Description: **Roll 14 · Grade 8 · Section A · 2026–27**.

Back link **Students** returns to the list with the filters kept in the query string.

**Overview card.**

| Shown by default | Hidden unless the school turns the field on |
| --- | --- |
| Photo or initials | Date of birth |
| Roll number, class, section, enrollment status | Gender |
| Subjects this teacher teaches this student | Address |
| Guardian name and relationship, for a class teacher | Guardian phone and email |

Fixture overview for Kabir Menon: guardian **Leela Menon · Mother**. Phone and email are not on the screen. A subject teacher of a section where they are not class teacher does not see the guardian block until the school enables parent communication for subject teachers (Phase 2, default off).

**Secondary blocks**, stacked on mobile, two columns from `lg`:

| Block | Content | Action |
| --- | --- | --- |
| Attendance | Last 10 school days as text badges (Present, Absent, Late) | **Full history** |
| Homework | This teacher’s tasks and the student’s status | **Open task** |
| Marks | Phase 2. Published marks in this teacher’s subjects only. | **Open paper** when entry is open |

There is no tab and no field for fees, transport, hostel, medical notes, counselling, siblings, or admission files.

The teacher cannot edit the name, roll number, or section. There is no save button on this page.

---

## 10. Attendance register

### Purpose

Let a class teacher record one daily status per student, and let every assigned teacher read the history. This is the screen that must work on a phone.

Parent attendance (a child’s month calendar plus a family leave dialog) is the wrong layout. The teacher screen is a register.

### Entry — `/app/attendance`

`PageContainer` title **Attendance**, description **One status per student per day.**

**Chooser** when the teacher has more than one relevant section:

| Control | Behavior |
| --- | --- |
| Section `Dropdown` | Only sections in scope. Fixture default: Grade 8 · Section A. |
| Date | Previous / next day, default today. Future dates are disabled. |
| Summary strip | **Not marked** or **Marked by Meera Iyer · 09:12**. |

### Register

Sticky context under the header on mobile: section name, date, and a live count **30 present · 1 absent · 1 late · 0 unmarked**.

Each student is a row:

| Zone | Spec |
| --- | --- |
| Identity | Roll, name. Minimum row height 64px on mobile. |
| Status | Four options from the school: **Present**, **Absent**, **Late**, **Excused**. Segmented control. Selected option uses the status badge colors plus a check icon and `aria-pressed="true"`. |
| Remark | Optional one-line field, collapsed behind **Add remark** so the register stays short. |

**All present** is a secondary button above the list. It sets every unmarked row to Present and leaves rows the teacher already changed. A confirmation is not required. The button is school-configurable and on by default.

**Save bar.** Sticky to the bottom of the viewport on mobile, static at the end of the card on desktop. Primary **Save attendance**. Disabled when nothing changed or a save is in flight. Label while saving: **Saving…**.

After a successful save: toast **Attendance saved**, and the summary updates to the marker’s name and time. A second tab that saved later shows an inline warning: **Updated by {name} at {time}. Reload to see their changes.** The in-progress edits remain until the teacher reloads. This matches the module rule on last-write.

### Submission states

| State | What the teacher sees | Primary action |
| --- | --- | --- |
| Unmarked, class teacher, window open | All rows on Present as a suggestion, badge **Not saved** | **Save attendance** |
| Saved, window open | Statuses as stored, **Edit** enabled | **Save attendance** after a change |
| Saved, window closed | Statuses as stored, controls disabled | None. Text: **The edit window has closed. Ask the school office to correct this day.** |
| View only (subject teacher) | Statuses as stored, no segmented controls | **View history** |
| No class teacher in the system | Register not shown | Empty state in 6.6’s wording |
| Holiday | Register not shown | **The school is closed on this date.** |
| Saving | Controls disabled, button **Saving…** | Wait |
| Save failed | Controls stay editable, toast **Could not save attendance** | **Retry** on the bar |
| Locked by the school | Read only, badge **Locked** | None |

Period-wise attendance is not a toggle on this screen. The data model allows one row per student per date.

### History

Below the register, or via **History** on a view-only section: month summary **Present 94% · Absent 4% · Late 2%** and a list of exception days (absences and lates), not every present day. Filters: date range, status. Pagination 25.

Opening a student name goes to that student’s profile.

---

## 11. Homework, lessons, and syllabus

### 11.1 Homework list — `/app/homework`

Phase 1. `PageContainer` title **Homework**, description **Work you set for your classes.** Action: **New homework** (primary).

Reuse the parent assignment-list interaction:

- Search, 300ms debounce, placeholder **Search by title**
- Subject chips, then a **More** chip if there are many
- Status `Dropdown`: All, Draft, Published, Closed
- Sort `Dropdown`: Due soon, Newest, Title
- Date range using the same panel pattern as `DateFilterPanel`
- Removable chips
- Page size **10**, matching the parent assignment list
- Card list, not a dense admin grid

**Card fields:** title, class · section · subject, due date, status badge, **12 of 32 submitted**.

Fixture cards:

| Title | Class | Due | Status | Submitted |
| --- | --- | --- | --- | --- |
| Linear equations — practice set | Grade 8 A · Mathematics | 22 Oct, 16:00 | Published | 18 of 32 |
| Fractions worksheet | Grade 7 B · Mathematics | 21 Oct, 16:00 | Published | 12 of 28 |
| Revision notes (draft) | Grade 8 B · Mathematics | Not set | Draft | — |

Clicking a card opens the task. **New homework** opens the editor.

Empty: **No homework yet.** Action **New homework**.

### 11.2 Homework editor

Route `/app/homework/new` and `/app/homework/{id}/edit`.

`PageContainer` title **New homework** or the task title.

| Field | Control | Rules |
| --- | --- | --- |
| Title | `Input`, required, max 200 | |
| Instructions | Textarea, optional | Min height 8rem. |
| Class and section | `Dropdown`, required | Options are teaching rows only. |
| Subject | `Dropdown`, required | Filtered by the class row. Often only Mathematics. |
| Due | Date and time, optional | School timezone. |
| Attachment | File input | Help text: **PDF or image, up to the school limit.** Other types are rejected with **This file type is not accepted yet.** |
| Status | Not a free dropdown | **Save draft** (secondary) and **Publish** (primary). |

Publish asks for a confirm step: **Students in Grade 8 A will see “Linear equations — practice set”.** Confirm **Publish**. Toast **Homework published**.

A published task can be unpublished only while the school allows it. The button is **Unpublish**, variant outline. Closed tasks are read-only except for feedback already in the tracker.

The teacher cannot pick a class outside the load. Co-teachers do not see **Edit** on someone else’s task unless the school enables shared editing (default off). They see the card as **View only**.

### 11.3 Submission tracker — `/app/homework/{id}`

Header: title, status, due, class. Actions: **Edit** (draft or if still allowed), **Close**.

Summary: **18 submitted · 14 not submitted**.

Student rows in roll order:

| Student | Status | Submitted | Score | Action |
| --- | --- | --- | --- | --- |
| Aanya Shah | Submitted | 21 Oct, 18:40 | — | **Review** |
| Kabir Menon | Not submitted | — | — | **Review** disabled |
| Diya Nair | Returned | 20 Oct, 15:02 | 8 / 10 | **Review** |

**Review** opens a sheet on mobile and a side panel from `lg`. Fields: file name and download, score (decimal), feedback (textarea), **Save feedback**. Toast **Feedback saved**.

The teacher does not upload the student’s work from this portal.

### 11.4 Lessons — `/app/lessons`

Phase 2. Hidden until the syllabus and journal tables exist.

`PageContainer` title **Lessons**, description **Plans and what you taught.**

Two stacks:

| Plan | Date | Class | State |
| --- | --- | --- | --- |
| Introducing linear equations | Wed 22 Oct | Grade 8 A | Planned |
| Fraction of a quantity | Thu 23 Oct | Grade 7 B | Planned |

**New plan** fields: date, class-section-subject (teaching rows), objective, method, resource note, optional link to one of the teacher’s homework tasks. **Save plan**.

**Class journal** on the same page, second card: date, the same class dropdown, **What was taught**, optional remark. **Save entry**. Past days lock when the school says so; the form then shows **This day is closed.**

### 11.5 Syllabus — `/app/syllabus`

Phase 2. Linked from Lessons as **Syllabus**.

Read-only outline published by the school, then a coverage control the teacher can set.

Fixture for Grade 8 Mathematics:

| Unit | Topic | Coverage |
| --- | --- | --- |
| 1. Number | Rational numbers | Taught · 4 Sep |
| 2. Algebra | Linear equations | In progress |
| 2. Algebra | Identities | Not started |

Coverage is a `Dropdown` per topic: Not started, In progress, Taught. Choosing Taught asks for a date, default today. The teacher cannot rename a unit or delete a topic.

Progress line: **4 of 12 topics taught** for this class-subject. It is not the student’s whole report.

Empty syllabus: **Your school has not published a syllabus for this subject.**

---

## 12. Examinations and marks

Phase 2. Sidebar item **Examinations** appears only then. The layout is specified so Phase 1 does not invent a different marks pattern later.

### Exam list — `/app/exams`

`PageContainer` title **Examinations**, description **Papers you teach. The school publishes results.**

Cards:

| Exam | Status | Papers in your subjects |
| --- | --- | --- |
| Term 1 · 2026–27 | Entry open | 2 |
| Mid year · 2026–27 | Published | 2 |

Opening an exam shows sittings: subject, class, section, start, end, room, entry status.

Fixture sitting: **Mathematics · Grade 8 A · Mon 2 Nov 2026 · 09:00–11:00 · Hall B · Entry open.**

No control for creating an exam, editing max marks, or publishing.

### Marks grid — `/app/exams/{examId}/papers/{scheduleId}`

`PageContainer` title **Term 1 · Mathematics**, description **Grade 8 · Section A · Max 80 · Entry open.**

Desktop (`lg`): a table.

| Student | Roll | Marks | Grade | Remark |
| --- | --- | --- | --- | --- |
| Aanya Shah | 08 | 74 | A | Steady work |
| Kabir Menon | 14 | 61 | B | |
| Diya Nair | 19 | Absent | — | Illness, office note |

Mobile (under `lg`): one card per student, in roll order. Marks grids are desktop-first; the card stack is the supported phone path so a teacher can correct a single mark, not so the full grid is squeezed into 360px.

| Field | Control |
| --- | --- |
| Marks | Numeric input. The API supplies max (80). The teacher cannot change max. |
| Absent | A checkbox **Absent**. When set, the numeric field clears and is disabled. Required because a blank must not become zero. |
| Remark | One line, optional. |
| Grade | Read-only text, computed from the school scale. |

Footer: **Saved as draft** or **Not saved**. Buttons **Save draft** and **Submit marks**.

Submit confirms: **Submit Grade 8 A Mathematics? You can still edit until the school verifies the paper.** Toast **Marks submitted**.

| Paper state | Grid |
| --- | --- |
| Entry open | Editable |
| Submitted, not verified | Editable until verified. Badge **Submitted**. |
| Returned by the exam cell | Editable, info banner **Returned: check question 4 totals.** |
| Verified or published | Read only. Banner **Verified by the exam cell.** |
| Another teacher’s paper | Permission state. The URL does not show their marks. |

Grade scale is a link **How grades are calculated** opening a read-only list of the school’s bands. No edit control.

### Report-card remark

On the exam, a second page **Class remarks** is visible only to the designated class teacher during the remarks window.

One textarea per student, label **Remark for the report card**. **Save remarks**. The teacher does not see **Generate**, **Publish**, or template pickers.

A subject teacher sees their subject remark from the marks grid and no second essay.

Published cards, when the school allows download: **Download** on the student profile’s marks block. Unpublished and withheld cards are absent.

---

## 13. Leave

Phase 2. This is the teacher’s own leave. It is not placed on the attendance register, and it does not reuse the parent **Apply leave** dialog’s child context.

### List — `/app/leave`

`PageContainer` title **Leave**, description **Your requests. The school approves them.** Action **Apply**.

**Balances** as stat cards, from the API, for the active academic year:

| Type | Fixture |
| --- | --- |
| Casual · paid | 8 of 12 days left |
| Sick · paid | 6 of 10 days left |
| Unpaid | No limit set |

**History** table, page size 10.

| Dates | Type | Days | Status |
| --- | --- | --- | --- |
| 27–28 Oct 2026 | Casual | 2 | Pending |
| 12 Sep 2026 | Sick | 1 | Approved |
| 3 Aug 2026 | Casual | 1 | Rejected |

Status uses badges plus the word. Rejected rows show the decision comment on the detail page.

Filters: type, status, date range. The list is only this staff member’s requests.

### Apply — `/app/leave/new`

| Field | Control |
| --- | --- |
| Leave type | `Dropdown` of active types |
| Start date | Date picker |
| End date | Date picker, on or after start |
| Reason | Textarea, optional unless the type requires it |
| Attachment | Optional PDF or image. Help text names the accepted types. |

There is no half-day control until the schema supports it.

**Submit request** confirms the day count. Toast **Leave request submitted**. The new row appears as **Pending**.

**Cancel** on a pending row. Confirm **Cancel this request?** Toast **Request cancelled**.

Approved future leave shows **Cancel** only when the school allows it; otherwise the detail says **Contact the school to change an approved leave.**

No approver queue, no colleague calendar, and no payroll line.

---

## 14. Notices, notifications, and communication

### Inbox — `/app/messages`

Phase 1. `PageContainer` title **Messages**, description **Announcements and alerts for you.**

The parent Updates page is the interaction model: category chips, search, date range, cards, mark-as-read toast. The categories here are teacher categories:

| Chip | Meaning |
| --- | --- |
| Unread | Default |
| All | Everything addressed to this user |
| Announcements | School or staff messages |
| Alerts | Notifications with a related record (homework, leave, timetable) |

Page size **12**, matching parent updates.

Card: unread dot, title, sender name, time, one-line body. Fixture senders are school roles, not private parent threads.

| Title | From | When |
| --- | --- | --- |
| Staff meeting moved to Thursday | School office | Today, 09:10 |
| Grade 8 excursion consent | Principal’s office | Yesterday |
| Fire drill at 11:40 | School office | Monday |

**Mark as read** on a card. Toast **Marked as read**. Opening the detail marks it read as well.

An alert card’s action is **Open**, which goes to the homework task, leave request, or day view identified by the notification. If that record is outside scope, **Open** shows the permission state.

Phase 1 has no **Compose** button.

### Detail — `/app/messages/{id}`

Title, sender, time, body, attachment if it is a PDF or image. **Back to messages**.

The teacher cannot edit or recall a school announcement.

### Class announcement — Phase 2

**New message** appears on the inbox only after the school enables class send.

Fields: section `Dropdown` (teaching scope), title, body, optional PDF or image. A preview line **This will go to 32 families in Grade 8 A.** The teacher does not type phone numbers. **Send** confirms, then toast **Message sent**.

**Sent** is a chip beside Unread. It lists only this teacher’s class messages, with a simple **Sent** or **Failed** count. Delivery troubleshooting stays in the Admin Portal.

### Guardian message — Phase 2

From a class teacher’s student profile, **Message family** opens a short composer: student name, guardian name (no phone), title, body, **Send**.

Default: subject teachers do not see the button. When the school enables it, the button’s help text is **Sent through the school. You will not see the family’s phone number.**

A reply thread is not in this layout. The detail page ends at the sent message.

Quiet hours and channel choice are not teacher settings. If the school blocks a send, the toast is **The school is not sending messages at this time.**

---

## 15. Profile, settings, and security

### Profile — `/app/profile`

`PageContainer` title **Profile**, description **The employment record your school holds.**

This is not the parent profile (personal, father, mother, transport, health).

**Identity card.** Avatar 64px, name **Meera Iyer**, designation, badge **Active**.

Read-only definition list, two columns from `sm`:

| Label | Fixture |
| --- | --- |
| Employee number | T-0142 |
| Email | meera.iyer@spdf.school |
| Joining date | 10 June 2019 |
| Department | Mathematics · Primary |
| Academic year | 2026–27 |

**Phone** is an `Input` when the school allows contact edits (default on). **Save phone** is enabled only when the value changed. Toast **Phone number saved**.

Email is shown and not editable. Help text: **Your school changes the login email.**

**Photo.** **Change photo** accepts a JPEG or PNG. Toast **Photo updated**. If the school disables photo edits, the control is absent.

**My documents.** A short list of staff files the school has marked visible: name, type, status badge (**Verified** or **Pending**). **Download**. There is no student-document wallet.

**Teaching load.** Three lines linking to class cards. Not an editor.

### Settings — `/app/settings`

`PageContainer` title **Settings**, description **Appearance and sign-in for your teacher account.**

Two cards on `lg`, stacked under it. Same grid as the parent settings page.

**Appearance.** The parent three-tile control: Light (`Sun`), Dark (`Moon`), System (`Monitor`). Active tile `border-brand bg-brand-muted text-brand`. Default System.

**Sign-in.** Text **Signed in as meera.iyer@spdf.school**. Links:

| Link | Route |
| --- | --- |
| Change password | `/app/settings/password` |
| Active sessions | `/app/settings/sessions` |

**Logout** is `Button variant="danger"`, same as the parent account card.

Notification preferences and two-factor are not on this page. They wait on schema the module document marks as later.

### Change password

| Field | Rules |
| --- | --- |
| Current password | Required, show/hide |
| New password | Required, at least 8 characters, show/hide |
| Confirm new password | Must match. Inline error **Those passwords do not match.** |

**Update password**. Toast **Password updated. Other sessions were signed out.** Then the current session stays and the sessions list would show one device.

Until the endpoint exists, the submit button remains, and a failed response uses **Password change is not available yet. Contact your school administrator.** Do not show a success toast in that case.

### Sessions

List from the API, this user only.

| Device | Last seen | Action |
| --- | --- | --- |
| This browser | Now | Badge **This device** |
| iPhone · Safari | Yesterday, 21:14 | **Sign out** |

**Sign out of all other devices** is a danger outline button with confirm **Sign out everywhere else?**

### Logout

Header menu and Settings both call the same action. Unsaved attendance or marks: dialog **You have unsaved changes. Leave without saving?** **Stay** / **Leave and sign out**.

---

## 16. Screen states

Every list and detail uses the parent convention: `Skeleton`, `EmptyState`, `ErrorState` with **Retry**, then the ready UI. Toasts carry success and action failure. A full-page error is for a failed load, not for a failed save.

| State | Pattern |
| --- | --- |
| Loading | `Skeleton` blocks that match the layout: header line, three stat rectangles, card rows. `DashboardSkeleton` is the reference shape. `aria-busy="true"` on the region. |
| Empty | Dashed `EmptyState`, 48px icon circle, title, one sentence, one action. |
| Error | `ErrorState` title, a plain sentence, **Retry**. No stack trace, no database wording. |
| Success | The updated UI plus a sonner toast. |
| Permission | `EmptyState` with a lock icon. Copy does not reveal whether the record exists. |
| Unsaved | Dirty flag, sticky save, confirm on navigate and logout. |

**Permission copy (one family):**

> **You don’t have access to this page**  
> It may belong to another class, or your school has not opened it.  
> **Back to home**

Use it for another teacher’s marks, a student outside the load, a Phase 2 URL during Phase 1, and an admin-only path.

**Field errors** sit under the control in `text-xs text-danger`, the `Input` error slot. A form with errors moves focus to the first invalid field.

**Partial data.** If announcements fail and the timetable loads, the timetable stays and the announcements card shows a compact **Could not load announcements** with **Retry**. The whole dashboard is not replaced.

---

## 17. Responsive behavior

Breakpoints match the Client UI. Mobile is the primary column. Desktop adds columns; it does not introduce a different product.

| Width | Behavior |
| --- | --- |
| Under 640px (`sm`) | Single column. Header subtitle hidden. Page title wraps. Filter chips wrap. Tables become cards. Sticky attendance save bar. Dialogs become full-height sheets. |
| 640–767px | Page actions sit on the same row as the title (`PageContainer`). Year chip remains. |
| 768–1023px (`md`) | Persistent sidebar. Register can show the segmented control beside the name. Marks stay in student cards. |
| 1024px and up (`lg`) | Dashboard two-column split. Marks become a table. Homework review can be a side panel. |

| Screen | Phone requirement |
| --- | --- |
| Login | Usable one-handed. Left brand panel hidden. |
| Dashboard | Welcome, next period, and today’s list without horizontal scroll. |
| My day | Day list, not a shrunken week grid. |
| Students | Card rows, search full width, filters wrap. |
| Attendance | Status choices at least 44px. Save bar always visible. |
| Homework list | Cards. |
| Marks | One student per card. Full grid only from `lg`. |
| Leave form | One column. |
| Messages | Cards. Composer full width. |

No screen depends on hover. Menus that open on click also close on Escape and on a click outside, as the parent filter menus do.

Print is limited to **My week** (timetable) and, in Phase 2, a published report card the school allows. Browser print hides the sidebar and header.

---

## 18. Components, interaction, and accessibility

### Reuse from the Client UI

| Component | Teacher use |
| --- | --- |
| `Button` | primary, secondary, outline, ghost, danger. Sizes `sm` `md` `lg` `icon`. |
| `Input` | Label, hint, error. Height `h-11`. |
| `Card` and header, title, description, content | Every panel. |
| `Badge` | Status words. |
| `Avatar` | Teacher in the header. Student initials on lists. |
| `Dropdown` | Filters and class pickers. Prefer it to a native select, as the parent component documents. |
| `EmptyState`, `ErrorState` | Empty, error, permission. |
| `Skeleton` | Loading. |
| `PageContainer` | Every page except the dashboard, which uses the dashboard’s own header. |
| `SectionHeader` | Widget titles with **View all**. |
| Date range panel | Homework, messages, leave history. |
| `sonner` | Success and failure of saves. |

### Teacher-specific components

Build these for this portal. Do not bend the parent child-attendance components into them.

| Component | Role |
| --- | --- |
| `PeriodCard` | One timetable row: time, class, room, Now / Done / Upcoming. |
| `ClassLoadCard` | One teaching assignment and its three links. |
| `TaskCountRow` | The three dashboard counts. |
| `AttendanceRegister` | Section, date, rows, sticky save, state from Section 10. |
| `StatusSegment` | Present / Absent / Late / Excused with text, icon, and `aria-pressed`. |
| `HomeworkCard` | Teacher task summary. |
| `MarksCard` / `MarksTable` | The responsive pair in Section 12. |
| `ScopeBanner` | The “class teacher is not assigned yet” and “view only” lines. |
| `UnsavedGuard` | Confirms navigation when the register or marks grid is dirty. |

### Interaction rules

| Rule | Detail |
| --- | --- |
| Search | 300ms debounce. Page returns to 1. |
| Filters | Chips plus a **Clear all**. URL query reflects them so Back restores the list. |
| Destructive | Unpublish, cancel leave, sign out other sessions, and logout-with-unsaved-edits use a confirm dialog: title, one sentence, **Cancel** (secondary) and the destructive verb (danger). |
| Save | One primary button. Disabled while pending. Double-clicks do not create two records. |
| Toasts | Short past-tense phrases: **Attendance saved**, **Homework published**, **Feedback saved**. |
| Links versus buttons | Navigation is a link. A save or a status change is a button. |
| Back | Detail pages have a text back link to the list, not only the browser back button. |

### Accessibility

Follow `docs/07-conventions.md` in the Client UI, plus the register and grid requirements below.

- Focus visible uses the global `outline-ring` at 2px offset.
- The skip link **Skip to content** is the first focusable control, targeting `<main>`.
- Sidebar buttons and the menu expose `aria-label` or `aria-expanded`, as the parent shell does.
- Menus use `role="menu"` and `role="menuitem"`. Dropdowns keep a real label, visible or `hideLabel`.
- Status is a word. The segment also sets `aria-pressed`.
- The register count is an `aria-live="polite"` region so a screen reader hears the tally after a change, not on every keystroke in a remark.
- Color contrast follows the existing token pairs (brand on brand-foreground, danger text on danger-muted). Do not put indigo text on teal.
- Respect `prefers-reduced-motion`. Do not add the parent glass-enter animation to these pages.
- Hit targets on the register, the drawer, and the save bar are at least 44px.
- Form errors are tied to inputs with `aria-invalid` and `aria-describedby`.
- Tables have a caption (visually available as the card title). Mobile cards use a heading per student.
- Language of the document is the school language. Fixture copy in this document is English. Status labels still come from school data when the API sends them.

---

## 19. Design fixtures

These values are for layout reviews and for empty-state comparisons. A prototype must label them **Design fixture** in the corner of the canvas or in the review notes. A build pointed at the API must not hard-code this roll, these counts, or this timetable.

If the API returns an empty list, the screen shows the empty state in this document, not this fixture.

| Item | Fixture |
| --- | --- |
| School | SPDF International School |
| Product | SPDF Teachers Portal |
| Teacher | Meera Iyer · Mathematics Teacher · T-0142 · meera.iyer@spdf.school |
| Year | 2026–27 |
| “Today” | Wednesday, 21 October 2026 |
| Department | Mathematics, primary |
| Load | Grade 8 A (lead), Grade 8 B (lead), Grade 7 B (lead), Grade 6 A (co-teacher), all Mathematics |
| Class-teacher badge on 8 A | Intended design only. The database has no class-teacher assignment. Phase 1 UI omits the badge and the mark button until that exists. |
| Students | Aanya Shah 08, Kabir Menon 14, Diya Nair 19, Arjun Patel 03, Sara Iqbal 11, Noah D’Souza 22 |
| Homework | “Linear equations — practice set”, “Fractions worksheet”, one draft |
| Messages | Staff meeting, excursion consent, fire drill |
| Exams | Term 1, entry not opened in the Phase 1 navigation |
| Leave | One pending casual request, one approved sick day, one rejected casual day |

Guardian phone numbers are intentionally absent from the fixtures.

---

## 20. Route map

| Route | Phase | Screen |
| --- | --- | --- |
| `/login` | 1 | Sign in |
| `/forgot-password` | 1 | Reset request |
| `/app` | 1 | Dashboard |
| `/app/day` | 1 | My day |
| `/app/timetable` | 1 | Week |
| `/app/calendar` | 1 | Month of holidays and own periods |
| `/app/classes` | 1 | Teaching load |
| `/app/classes/{id}` | 1 | One class-subject |
| `/app/students` | 1 | Directory |
| `/app/students/{id}` | 1 | Student profile |
| `/app/attendance` | 1 | Register or view-only history |
| `/app/homework` | 1 | Task list |
| `/app/homework/new` | 1 | Editor |
| `/app/homework/{id}` | 1 | Tracker |
| `/app/messages` | 1 | Inbox |
| `/app/messages/{id}` | 1 | Detail |
| `/app/profile` | 1 | Employment profile |
| `/app/settings` | 1 | Appearance and sign-in |
| `/app/settings/password` | 1 | Change password |
| `/app/settings/sessions` | 1 | Devices |
| `/app/leave` | 2 | History and balances |
| `/app/leave/new` | 2 | Application |
| `/app/lessons` | 2 | Plans and journal |
| `/app/syllabus` | 2 | Coverage |
| `/app/exams` | 2 | Exam list |
| `/app/exams/{examId}/papers/{scheduleId}` | 2 | Marks |
| `/app/resources` | 2 | Class files and employment documents |
| `/app/messages/new` | 2 | Class announcement |
| `/app/reports` | 3 | Own class figures |

Resources, when Phase 2 starts, use `PageContainer` title **Resources**, two stacks (**School files** read-only, **My class files** with upload of PDF or image tied to a teaching row). Employment documents remain on Profile. That page follows the same empty, error, and permission states as the lists above.

---

## 21. Implementation guardrails

These are design constraints for a later build. This document does not authorize that build.

1. Keep Admin Portal routes and parent-portal routes out of this navigation.
2. Take color, type, radius, button, input, card, badge, empty, and shell behavior from `ERPWEB/ERPCLIENTWEB`.
3. Treat Section 19 as a picture of the UI, never as a repository response.
4. Hide Phase 2 and Phase 3 routes until `TEACHER_PORTAL_MODULES.md` says the API and schema are ready.
5. On a direct link outside the teacher’s classes, show Section 16’s permission state and no student names.
6. Do not place fee, transport, health, or admission fields on a student card to “fill the layout”.
