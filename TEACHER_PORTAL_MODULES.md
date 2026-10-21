# Teachers Portal — Module Requirements

**Status:** Requirements revised. This revision does not authorize a one-step rebuild.  
**Date:** 21 October 2026  
**Product:** Teachers Portal for the existing School ERP  
**Audience:** Product, design, and engineering  
**Companion systems:** Admin Portal (`ERPWEB/ERPADMIN`), parent ERP Client (`ERPWEB/ERPCLIENTWEB`), School ERP API (`ERPWEB/ERPBACKEND`)

The Admin Portal remains the system of record for school setup. The parent ERP Client remains the visual reference for login, typography, colour, spacing, forms, and buttons. Neither application is redesigned by this document. The Teachers Portal is a separate Next.js application with its own login and its own navigation.

**Visual reference:** the ERP Client login and shell. Teacher copy, scope, and modules are not a copy of the parent portal. There is no child selector, fee view, transport view, or Google sign-in.

---

## 1. Purpose

A teacher opens this portal to run the teaching day and to follow their own employment requests through to a decision.

1. What do I teach today, and which class is next?
2. Which students am I responsible for?
3. What must I record: attendance, homework, marks, lesson plans?
4. What has the school told me, and what leave or support request is still open?

Fees, admissions, payroll, transport, hostel, inventory, user administration, and school configuration stay in the Admin Portal.

---

## 2. What already exists

| Area | Current state |
| --- | --- |
| Admin Portal | School-admin shell. Many screens are shells. It is not modified by the Teachers Portal. |
| Parent ERP Client | Separate Next.js app. Source of the visual language only. |
| Database | Approved model covering schools, years, users, staff, classes, sections, subjects, enrollments, teacher-subject assignments, timetable periods, student attendance, leave types and requests, exams, marks, grades, report cards, assignments, submissions, communications, notifications, documents, files, approvals, and reports. |
| Live API | `POST /api/v1/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/firebase`, plus upload presign and multipart upload. Login is specified for admin passwords. Firebase token exchange is specified for parents. |
| Teacher business API | Not implemented. No teacher-scoped list, create, or update endpoint exists for classes, students, attendance, homework, marks, leave, messages, lessons, or tickets. |
| Teacher identity | A teacher is a `staff` row linked to a `users` row. Teaching load is `teacher_subjects` joined to `class_subjects`. Periods are `timetable_entries.teacher_id`. |
| Missing teacher concepts | No class-teacher column on a section. No substitution table. No lesson-plan, syllabus, behaviour-note, class-resource, support-ticket, or staff self-attendance table confirmed for this portal. |

**Rule:** a feature is not available because an admin screen or a table name exists. If the teacher cannot call a scoped API, the feature is **API required**. If the database cannot store it, it is a **schema gap**. Until then, any sample figures in the UI are **mock data** and must be labeled as such. They are not live school records and they are not saved to the server.

---

## 3. How to read each module

| Tag | Meaning |
| --- | --- |
| **Teacher** | The signed-in teacher can do this inside the assignment boundary. |
| **Admin-only** | Done in the Admin Portal. This portal does not offer the action. |
| **School-configured** | The school turns the behaviour on or sets the rule. The teacher cannot change the rule. |
| **API: existing** | An endpoint exists. It still needs a teacher-role and scope check before this portal may use it. |
| **API: required** | The data model can store the fact, and a teacher-scoped endpoint is still needed. |
| **Schema gap** | The approved database cannot store the fact. |
| **Mock until API** | The screen may be built with labeled sample data. It must not claim the school saved the change. |

Priority:

| Priority | Meaning |
| --- | --- |
| **Must Have** | Required for a usable teacher portal. The screen exists and is reachable. Live save waits on the API where noted. |
| **Should Have** | Important academic-cycle work. Built after the teaching-day path, still inside this product. |
| **Future Enhancement** | Specified so it is not forgotten and not slipped into the first build. |

Delivery phases:

| Phase | Intent |
| --- | --- |
| **Phase 1 — Teaching day** | Login, Dashboard, timetable, own classes and students, attendance view, homework, inbox and notification bell, profile, sign-out. |
| **Phase 2 — Academic cycle** | Leave (full module), lessons and syllabus, marks, behaviour notes, class announcements, resources, calendar depth. |
| **Phase 3 — Insight** | Reports, performance trends, help-desk depth, released appraisal. |

Leave Management is a first-class module with its own sidebar entry. It is not folded into Settings or Calendar. Its persistence is **API required**. Until that API exists, the leave screens use labeled mock data.

All 18 modules are discoverable. A missing API disables the write action and explains why. It does not hide the module. Actions the teacher must never have (approve their own leave, assign a substitute, publish verified results, open another class) stay unavailable even in mock mode.

---

## 4. Roles

| Role | Where they work | Portal treatment |
| --- | --- | --- |
| Subject teacher | Teachers Portal | Default user. Sees only assigned class, section, and subject records. |
| Class teacher | Teachers Portal | Same login. Extra rights for designated sections: daily student attendance and class-level remarks. Designation is **Admin-only** and a **schema gap** today. |
| Co-teacher | Teachers Portal | Second staff member on the same class-subject. View by default. Write rights are **School-configured**. |
| Substitute teacher | Teachers Portal | Temporary right for a date and period. View of an arrangement is in scope. Creating the arrangement is **Admin-only**. **Schema gap**. |
| Head of department | Admin Portal | Not a teacher-portal role. A department-wide student list is a **Future Enhancement** and off by default. |
| School administrator, principal, HR, exam cell | Admin Portal | Accounts, load, timetable, exams, mark verification, report cards, leave decisions, substitute allocation, school announcements. |
| Parent | Parent ERP Client | Never signs in here. |
| Student | Out of scope | No student login here. |

A person who is both an administrator and a teacher uses the Admin Portal for administration and this portal for teaching. One session does not unlock the other portal.

---

## 5. Assignment boundary

This rule overrides every screen.

A teacher may open a class, section, subject, student, or academic record only when the active academic year links that record to their staff id. The server derives the scope. A class id, section id, subject id, or student id from the browser is not proof of access.

### 5.1 Teaching scope

A teaching row is `teacher_subjects.staff_id` for the signed-in staff member, joined to `class_subjects`, and a section. A set `section_id` limits the row to that section. An empty `section_id` covers every active section of that class-subject for the year.

`is_primary` means lead teacher for that class-subject. It does not mean class teacher of the section.

### 5.2 Student scope

A student is visible when an active `student_enrollments` row matches a teaching row. The teacher sees identity and class placement, attendance as allowed below, and homework or marks only for the subjects on the matching teaching rows.

### 5.3 Daily student attendance

`attendance_records` allows one status per student per date. Subject teachers do not keep a second daily mark.

| Actor | Attendance |
| --- | --- |
| Designated class teacher of that section and year | Create and edit while the edit window is open, including bulk entry, draft, and submit. |
| Subject teacher of a student in that section | View only. |
| Any other teacher | No row. |
| Administrator | Full mark, lock, and correction rights in the Admin Portal. |

Until a class-teacher assignment exists, this portal shows student attendance as read-only. Mark, bulk entry, draft, and submit stay disabled with that explanation. That write path is **School-configured**, **Admin-only** to designate, and a **schema gap**.

### 5.4 Forbidden shortcuts

- Browsing every student in the school, branch, or department.
- Opening a student by an admission number outside the teacher's sections.
- Seeing another teacher's unpublished marks, private remarks, leave, or appraisal.
- Seeing fees, medical files, counselling notes, salary, or other HR files.
- Using a past academic year except as read-only history when the school leaves that year open.

### 5.5 Empty scope

A teacher with no staff profile, or no teaching rows for the active year, lands on an empty Dashboard that says the school has not assigned classes. The portal does not fall back to a school-wide list.

---

## 6. Explicitly out of this portal

Admissions, student create and promotion, ID cards, certificates, fees, payroll, library circulation, transport, hostel, inventory, front office, gallery administration, user and role management, school settings, audit-log browsing, and platform super-admin.

Teachers also do not receive these rights inside this portal:

- Creating teacher accounts or school-wide employee records.
- Approving their own leave.
- Assigning or editing substitute teachers.
- Editing the school-wide timetable.
- Publishing verified results without an explicit permission.
- Opening classes, subjects, or students outside the assignment boundary.

---

## 7. Navigation

The landing label is **Dashboard**, not Home. After a successful teacher sign-in the portal opens `/app`, the Dashboard.

Related work sits under one module so the sidebar does not list the same job twice.

| Sidebar item | Route | Contains | Not a separate sidebar item |
| --- | --- | --- | --- |
| Dashboard | `/app` | Module 1 | Home |
| Timetable | `/app/timetable` | Module 5. Daily, weekly, and substitutions | A second “My day” item. Today’s periods also appear on the Dashboard |
| My Classes | `/app/classes` | Module 3. Expandable: Classes, Students | A second top-level Students item |
| Attendance | `/app/attendance` | Module 2. Expandable: Student attendance, My attendance | Two attendance products in the sidebar |
| Homework | `/app/homework` | Module 6 | |
| Curriculum | `/app/curriculum` | Modules 4 and 9. Expandable: Subjects, Lesson plans | A separate Lessons item |
| Examinations | `/app/exams` | Modules 7 and 8. Expandable: Marks, Performance | A separate Results item |
| Resources | `/app/resources` | Module 10 | |
| Behaviour | `/app/behaviour` | Module 11. Hidden when the teacher has no behaviour permission | |
| Leave | `/app/leave` | Module 13. Internal sections, not extra sidebar rows | Leave buried under Calendar or Settings |
| Calendar | `/app/calendar` | Module 14 | The leave calendar, which stays inside Leave |
| Messages | `/app/messages` | Module 12 | A second inbox beside the notification bell |
| Reports | `/app/reports` | Module 16 | |
| Help | `/app/help` | Module 18 | |
| Profile | `/app/profile` | Module 15, including security | A competing top-level Settings label |

Header, on every signed-in page:

- School name, school-local date, and the active academic year.
- Global search across records the teacher is allowed to open (students, classes, homework, leave applications, messages).
- Notification bell with an unread count. Opens a short list and links to `/app/notifications` (Module 17).
- Profile menu: Profile, Security, Help, Logout.

Inner pages show a breadcrumb from the module to the record, a page title, and the primary action for that page. Tables that can grow use search, filters, sortable columns, and pagination.

The sidebar shows an icon and an active state. Groups may expand. Below the `md` breakpoint the sidebar becomes a drawer opened from the header. The ERP Client spacing, type, and colour remain the reference. Cards stay solid. Dates use `en-GB`. The collapsed mark is the letter S.

---

## 8. Cross-cutting rules

| Rule | Requirement |
| --- | --- |
| Tenant and year | Every request is bound to the teacher's school and the active academic year. Teachers cannot open or close a year. |
| Time | Dates and periods use `schools.timezone`. |
| Copy | Attendance statuses, grade labels, and leave names come from school data when the API provides them. |
| Authorization | Hiding a button is not security. The API enforces role, school, and assignment scope. |
| Sensitive student data | Fees, medical files, counselling notes, and admission documents never appear. Date of birth, gender, address, and guardian phone or email are **School-configured** and off by default. |
| Behaviour and parent notes | Visible only to a teacher authorized for that student. Unrelated teachers see neither the record nor a hint that it exists. |
| Audit | Attendance edits, marks, published homework, leave decisions, and parent messages write an audit record. Teachers cannot read the audit log. |
| Files | The existing upload API accepts JPEG, PNG, HEIC, HEIF, and PDF only. Other types wait on an upload-policy change. The UI rejects anything outside the allow-list. |
| Validation | Forms validate before submit. Dates, required reasons, and marks against a maximum are checked in the form and again by the API. |
| Feedback | Loading uses skeletons. Empty, error, success, and permission-denied states are written for each module. Destructive or submitting actions ask for confirmation. Successful UI actions use a toast that says whether the change stayed in the browser or was accepted by the school. |
| Mock data | Sample records use realistic names and are captioned as design fixtures. Toasts for mock writes say the change was not sent to the school. |
| Mobile | Dashboard, timetable, attendance, and leave must work on a phone. Wide marks grids may stay easier on a desktop. |

---

## 9. Module 1 — Dashboard

**Priority:** Must Have  
**Route:** `/app`  
**Purpose:** One overview of this teacher's academic day, with each figure linking to its module.

### Submodules

| Submodule | Priority |
| --- | --- |
| Welcome and quick actions | Must Have |
| Today’s timetable and the current or next period | Must Have |
| Count cards | Must Have |
| Announcements and notifications | Must Have |
| Leave, marks, lessons, meetings, and events | Should Have, and mock until their APIs exist |

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Greeting, name, designation, and academic year | Must Have | Teacher |
| Total assigned classes and assigned subjects | Must Have | Teacher. API: required |
| Today’s class count and the period list | Must Have | Teacher. API: required |
| Today’s student-attendance status for designated sections, otherwise “view only” | Must Have | Teacher. Write is a schema gap |
| Pending homework checking | Must Have | Teacher. API: required |
| Upcoming examinations | Should Have | Teacher. API: required. Linked even when entry is closed |
| Upcoming events and announcements | Must Have for announcements. Should Have for the wider event list | Teacher |
| Pending marks submission | Should Have | Teacher. API: required |
| Pending lesson plans | Should Have | Schema gap. Mock until a lesson API exists |
| Leave balance summary | Must Have as a card that opens Leave | Mock until the leave API exists. Not presented as a live balance |
| Recent notifications | Must Have | Teacher. API: required |
| Upcoming meetings and deadlines | Should Have | Mock until calendar and workflow APIs exist |
| Quick actions: Take attendance, Add homework, Enter marks, Create lesson plan, Apply for leave | Must Have as links | Each target enforces its own permission. Disabled actions explain why |
| Task completion summary | Should Have | Derived. API: required |

Charts are limited to counts the teacher already owns, such as homework to review. A chart that needs other classes’ results is a **Future Enhancement**.

### Teacher actions

Open a card or a timetable row and land in that module with the matching filter. Quick actions start the matching flow.

### Permissions

`teacher.dashboard.view`

### Admin responsibilities

Publish the timetable, assignments, holidays, and announcements the Dashboard reads. The admin does not have a second home inside this portal.

### Dependencies

Teaching load, timetable, homework, and inbox are **API required**. Leave balance, lesson plans, meetings, and marks-due are **Mock until API** or a **schema gap**. An empty teaching load shows the empty state from Section 5.5, not sample classes.

---

## 10. Module 2 — Attendance Management

**Priority:** Must Have for student attendance view. Write is blocked until a class teacher can be stored.  
**Route:** `/app/attendance`  
**Purpose:** Keep the teacher’s own attendance separate from the student register, and limit student marking to authorized sections and dates.

### Submodules

| Submodule | Priority | Notes |
| --- | --- | --- |
| Student attendance | Must Have | Class, section, date, register, history, percentages |
| My attendance | Should Have | The teacher’s own present, absent, late, and leave record |

### Student attendance

| Feature | Priority | Tags |
| --- | --- | --- |
| Class and section register for a date | Must Have | Teacher, assignment boundary |
| Statuses the school configured (Present, Absent, Late, Excused, and any added status) | Must Have | School-configured |
| Mark, bulk “all present”, save draft, submit | Must Have once class teacher exists | Schema gap today. Disabled until then |
| One status per student per date | Must Have | Matches `attendance_records` |
| History, monthly summary, student percentage | Must Have | API: required |
| Short-attendance and frequently absent lists | Should Have | Threshold is School-configured. Wording stays constructive |
| Correction request | Should Have | Teacher may request. Admin decides |
| Submission status for the day | Must Have | Draft, submitted, locked |
| Period-level attendance | Future Enhancement | Conflicts with one row per student per day |
| Message guardians when a student is absent | Future Enhancement | Off until communication is live |

Teachers manage student attendance only for assigned classes and, for writing, only for sections where they are the designated class teacher. A subject teacher of the same section can view.

### My attendance

| Feature | Priority | Tags |
| --- | --- | --- |
| Daily and monthly summary, history, percentage | Should Have | Not the same table as student `attendance_records` |
| Present, absent, late, and leave details | Should Have | Leave days should agree with Module 13 once both APIs exist |
| Correction request | Should Have | Admin or HR decides. **API required** after the HR source is confirmed |

No staff self-attendance table was confirmed for this portal. Until HR provides that contract, My attendance is a labeled mock or an empty state that says the school has not connected staff attendance. It must not be invented as a live punch system.

### Teacher actions

Choose section and date. Read the register. Where authorized, mark statuses, save a draft, and submit. Request a correction. Open a student percentage. Review their own attendance summary when that source exists.

### Permissions

`teacher.attendance.view` for in-scope students. `teacher.attendance.mark` only for designated class-teacher sections. `teacher.attendance.self.view` for My attendance.

### Admin responsibilities

Status list, edit window, class-teacher designation, lock, and final corrections. HR owns staff attendance policy.

### Dependencies

`attendance_records` can store the student register. Class teacher is a **schema gap**. Staff self-attendance is unconfirmed and stays mock or empty.

---

## 11. Module 3 — My Classes

**Priority:** Must Have  
**Route:** `/app/classes`, `/app/classes/[assignmentId]`, students under `/app/classes/students`  
**Purpose:** Show the classes, sections, and students this teacher actually teaches.

### Submodules

Assigned classes and sections, class detail, student list, student profile, class timetable, class announcements and resources.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Searchable, filterable class list with strength, subject, and role | Must Have | Teacher. `is_primary` is Lead, not class teacher |
| Class detail with students, subjects, timetable, attendance summary, and performance summary | Must Have for the first four. Performance summary is Should Have | Assignment boundary |
| Class-teacher badge | Should Have | Hidden until the schema can store the designation. Do not infer it from `is_primary` |
| Student list with roll, attendance percentage, and open homework | Must Have | API: required |
| Student profile | Must Have | Identity and placement. Guardian phone and email hidden by default |
| Subject allocation inside the class | Must Have | Only subjects on the teacher’s rows, plus a read-only note of the class’s other subjects if the API provides it |
| Academic history | Should Have | Read-only, current or opened years, in-scope subjects only |
| Class announcements and resources | Should Have | Deep links into Modules 12 and 10 |

### Teacher actions

Search and filter. Open a class. Open a student. Jump to that class’s timetable, attendance, or homework.

### Permissions

`teacher.load.view`, `teacher.students.view`

### Admin responsibilities

Create classes, sections, enrollments, and teaching assignments.

### Dependencies

`teacher_subjects`, `class_subjects`, `student_enrollments`. Class teacher remains a schema gap. Performance numbers wait on published marks.

---

## 12. Module 4 — Subjects and Curriculum

**Priority:** Should Have  
**Route:** `/app/curriculum`  
**Purpose:** Show the subjects this teacher is assigned and, when the school has a syllabus, how much of it is planned and done.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| My subjects and class-wise mapping | Must Have as a list, delivered with My Classes if the curriculum API is not ready | Teacher |
| Curriculum and syllabus overview | Should Have | Schema gap |
| Chapters, topics, and learning objectives | Should Have | Schema gap |
| Planned versus completed syllabus, remaining topics, progress | Should Have | Schema gap. Mock until stored |
| Teaching materials and lesson-plan links | Should Have | Links to Modules 10 and 9 |
| Edit the school curriculum | Admin-only | Teachers update completion only when the school allows it |

### Teacher actions

Open an assigned subject. Review topics. Mark a topic complete only when that write exists and the teacher is assigned to it.

### Permissions

`teacher.load.view` for the subject list. `teacher.curriculum.update` only if the school enables completion updates.

### Admin responsibilities

Own the syllabus, chapters, and objectives. Teachers do not rewrite the school curriculum.

### Dependencies

Subject mapping can use current teaching tables. Chapters, topics, and completion are a **schema gap**.

---

## 13. Module 5 — Timetable and Schedule

**Priority:** Must Have for the published personal timetable. Substitutions are Should Have and a schema gap.  
**Route:** `/app/timetable`  
**Purpose:** Show this teacher’s day and week without letting them edit the school timetable.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Daily and weekly views | Must Have | Teacher. API: required |
| Period, subject, class, section, room | Must Have | Teacher |
| Current and next period | Must Have | Derived from the school clock |
| Free periods | Must Have | Periods with no personal assignment |
| Class-wise period schedule for an assigned class | Should Have | Read-only |
| Substitute schedule | Should Have | Schema gap. View only |
| Change notifications | Should Have | Module 17 |
| Conflict indicator | Future Enhancement | Only if the API detects overlaps. The UI does not invent a conflict |
| Edit or publish the school timetable | Admin-only | Forbidden here |

### Teacher actions

Move by day or week. Open the class for a period. Open a substitute row when one exists.

### Permissions

`teacher.timetable.view`

### Admin responsibilities

Build and publish the timetable. Allocate substitutes.

### Dependencies

`timetable_entries` and `holidays`. Publication state, if drafts must stay hidden, is a schema gap. Substitution is a schema gap.

---

## 14. Module 6 — Homework and Assignments

**Priority:** Must Have  
**Route:** `/app/homework`  
**Purpose:** Let the teacher set work for an assigned class-subject and review what came back.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Create with class, section, subject, title, instructions, assigned date, and due date | Must Have | Teacher. Validation required. API: required |
| Upload PDF or image worksheets | Must Have | API: existing upload, teacher authorization still required. Other file types are rejected |
| Draft, publish, edit, and close | Must Have | School-configured. Admin approval of homework is off by default |
| Submitted, pending, late, and missing | Must Have | Late acceptance is School-configured |
| Marks, feedback, and return for correction | Must Have | Teacher, own tasks |
| History, completion report, deadline reminder | Should Have | Report links to Module 16. Reminder links to Module 17 |
| Search, filters, pagination | Must Have | Status, class, due date |

### Teacher actions

Create, save draft, publish, close, open a submission, record feedback, and return work. The UI confirms publish.

### Permissions

`teacher.homework.manage` inside teaching scope. Co-teachers edit only when the school allows it. Default is off.

### Admin responsibilities

School-wide assignment policy. Not a second homework queue unless the school turns approval on.

### Dependencies

`assignments` and `assignment_submissions`. A reliable attachment list is a schema gap; until it exists, files use the upload API and the UI says the catalogue is not confirmed.

---

## 15. Module 7 — Exams and Marks Management

**Priority:** Should Have  
**Route:** `/app/exams`  
**Purpose:** Let the teacher enter marks for open papers they teach, and stop them from publishing results or changing verified marks.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Examination schedule by class, subject, and section | Should Have | Teacher. API: required |
| Student-wise marks, theory, practical, and internal assessment | Should Have | Only the components the paper defines |
| Maximum marks set by the school, obtained marks entered by the teacher | Should Have | The form and the API reject a value above the maximum or below zero |
| Grade and percentage | Should Have | Calculated from the school scale. The teacher does not edit the scale |
| Save draft and submit | Should Have | States: draft, submitted, verified, published |
| Verification status, deadlines, reminders | Should Have | |
| Result analysis | Should Have | Own papers only. Unpublished marks stay in this module, not in a public report |
| Question papers | Should Have | Only with an explicit permission. Default off |
| Re-test or improvement records | Future Enhancement | Shown when the exam model has that paper type |
| Correction request after submit | Should Have | Teacher requests. Admin decides |
| Publish results or edit verified marks | Admin-only | Hidden here unless a separate permission exists. Default: no |

Absent, zero, and not applicable need distinct statuses so a blank is not stored as zero. That status is a **schema gap** until the API defines it. Max marks should be fixed once per paper. Today they can sit on each student row; the API must stop that drift.

### Teacher actions

Open an entry window, enter marks, save a draft, submit, and request a correction. The UI blocks submit when a mark is invalid.

### Permissions

`teacher.exams.marks.enter` for open papers in scope. `teacher.exams.publish` is not granted. `teacher.exams.papers.manage` is off unless the school adds it.

### Admin responsibilities

Create exams, set max marks, open and close entry, verify, and publish.

### Dependencies

`exams`, `exam_schedules`, `exam_marks`, `grading_scales`, `grades`. Entry transitions must be specified by the API before this module can save.

---

## 16. Module 8 — Student Performance and Progress

**Priority:** Should Have  
**Route:** under Examinations, `/app/exams/performance`  
**Purpose:** Help the teacher see how students in their own subjects are progressing, and where extra support would help.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Individual progress and subject performance | Should Have | In-scope subjects only |
| Class average and assessment comparison | Should Have | Own classes. School-average comparison is off by default |
| Homework performance beside exam results | Should Have | |
| Students who may need extra support | Should Have | Constructive wording. No automatic negative labels |
| Weak-area hints and improvement notes | Should Have | Written by the teacher. Not a generated judgement |
| Teacher remarks and report-card remarks | Should Have | Report-card remarks only for a designated class teacher, and only while the remarks window is open |
| Charts and trends | Should Have | Built from authorized rows. Empty when the API has no series |

### Teacher actions

Filter by class, subject, and assessment. Open a student. Save a remark when authorized.

### Permissions

`teacher.performance.view` inside scope. `teacher.report_cards.remark` for class teachers only.

### Admin responsibilities

Thresholds, whether school averages are visible, and the remarks window.

### Dependencies

Published marks, attendance, and homework. Support flags are derived, not a new stigmatising status. Confidential welfare records stay out.

---

## 17. Module 9 — Lesson Planning

**Priority:** Should Have  
**Route:** `/app/curriculum/lessons`  
**Purpose:** Let the teacher plan daily and weekly lessons against the syllabus and record what was taught.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Create a plan: class, section, subject, chapter, topic, objectives, methods, activities, resources, duration, date | Should Have | Schema gap |
| Daily and weekly list or calendar | Should Have | |
| Planned versus completed, completion status | Should Have | Feeds Module 4 when both exist |
| Submit for approval, then see approved, rejected, or revision requested | Should Have | Only if the school uses approval. Otherwise the plan is simply saved |
| History | Should Have | |

### Teacher actions

Create, edit while still editable, mark complete, and submit when approval is on.

### Permissions

`teacher.lessons.manage` for assigned class-subjects.

### Admin responsibilities

Approval, when the school requires it. The school owns the syllabus the plan points at.

### Dependencies

**Schema gap.** There is no lesson-plan table. The screen may ship with labeled mock plans. Saving them is not a school record.

---

## 18. Module 10 — Study Materials and Resources

**Priority:** Should Have  
**Route:** `/app/resources`  
**Purpose:** Give the teacher a library of materials for their classes, separate from private employment documents.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Upload notes and worksheets as PDF or image | Should Have | Existing upload types only. Size and type are validated |
| Presentations, Office files, and video | Future Enhancement | Blocked by the current upload allow-list |
| Chapter, class, and subject categories | Should Have | Schema gap for a class-resource link |
| Reference links | Should Have | |
| Share with students of an assigned class | Should Have | Explicit action. Upload alone does not publish to families |
| Preview, download, search, filter, sort, history | Should Have | |
| Employment documents on the teacher’s profile | Must Have as read-only when documents exist | See Module 15 |

### Teacher actions

Upload into an assigned class-subject, categorize, share, preview, and remove their own unpublished file.

### Permissions

`teacher.resources.manage`

### Admin responsibilities

Document types, verification of staff documents, and any school-wide library.

### Dependencies

Uploads exist without a teacher authorization rule. A class-resource catalogue is a **schema gap**.

---

## 19. Module 11 — Student Behaviour and Remarks

**Priority:** Should Have  
**Route:** `/app/behaviour`  
**Purpose:** Record classroom observations the school has authorized this teacher to keep, including positive work as well as concerns.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Positive achievement, academic remark, participation | Should Have | Schema gap for a teacher note |
| Discipline incident | Should Have | Restricted. Not a public class feed |
| Date, follow-up, and status | Should Have | |
| Parent communication note | Should Have | Only when the school enables it, and only for that student |
| History | Should Have | Date-wise |

The form asks for a neutral description, a category, and an optional follow-up. The interface does not apply a fixed negative label to the student.

### Teacher actions

Add a note for a student in scope, review history, and update follow-up when the note is still theirs to edit.

### Permissions

`teacher.behaviour.record` for students in scope. Sensitive categories can be limited to the class teacher. Default: subject teachers may record academic and positive remarks; discipline and parent notes require the class-teacher permission or an explicit school flag.

### Admin responsibilities

Policy, retention, and any welfare case that belongs in the Admin Portal. Teachers do not see counselling files.

### Dependencies

**Schema gap.** Unrelated teachers receive no row and no existence hint. Mock notes, if shown in design, use fictional students already inside the fixture and are labeled.

---

## 20. Module 12 — Communication and Announcements

**Priority:** Must Have for reading. Should Have for sending.  
**Route:** `/app/messages`  
**Purpose:** Show school messages this teacher is allowed to read, and allow a class or family message only when the school turns that on.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| School notices, principal and admin messages, meeting notices | Must Have | Read. API: required |
| Read state, search, filters, pinned or important | Must Have | |
| Attachments on a message | Should Have | Upload allow-list |
| Class announcement | Should Have | School-configured. Default off. Assigned section only |
| Parent or student-specific message | Should Have | School-configured. Default off. See access rules below |
| Communication history | Should Have | Own messages and messages addressed to this teacher |
| Preferences | Future Enhancement | Schema gap |

### Teacher actions

Read, filter, mark read, and open a linked record. Compose only when the school has enabled that audience.

### Permissions

`teacher.communication.read`. `teacher.communication.send_class` and `teacher.parents.message` are separate and off by default.

### Admin responsibilities

Channels, templates, school-wide sends, and emergency broadcasts.

### Access

- Inbox is limited to this user.
- A class send includes only guardians of students in the chosen teaching scope.
- Recommended default: class teachers may message a section; subject teachers do not, unless the school enables subject messages.
- Guardian phone and email stay hidden. The system delivers the message.
- Two-way chat is a **Future Enhancement** and a schema gap.
- Teachers cannot export contacts or message families they do not teach.

---

## 21. Module 13 — Leave Management

**Priority:** Must Have as a module and as its own sidebar entry.  
**Route:** `/app/leave`  
**Purpose:** Let the teacher apply, see the balance, follow every request to a decision, and see substitute updates. Approval and substitute allocation stay with the school.

Persistence is **API required** (`leave_types`, `leave_requests`, `holidays`, `approval_requests`). Until those teacher-scoped endpoints exist, every figure and every submit is **mock** and labeled. A mock submit does not create a school leave record.

### Landing

Summary cards: total balance, used leave, pending requests, upcoming approved leave. Sections or tabs:

1. Apply for leave
2. Leave history
3. Leave balance
4. Leave calendar
5. Substitute arrangements

### A. Apply for leave

| Feature | Priority | Tags |
| --- | --- | --- |
| New application | Must Have | Teacher, own `staff_id` only |
| Leave type from school categories | Must Have | Admin-owned types. Casual, sick, and earned are examples, not a hard-coded policy |
| Full day. Half day only when the school supports it | Must Have for full day. Half day is a schema gap | Dates are stored as whole dates today |
| Start, end, and a calculated day count shown before submit | Must Have | The API recalculates. The form does not trust a typed day count |
| Reason | Must Have | Required |
| Supporting file | Should Have | Required only when the leave type says so. PDF or image |
| Affected classes and periods | Should Have | Read from the teacher’s timetable. Informational |
| Submit and confirmation | Must Have | Mock confirmation until the API exists |
| Save draft | Should Have | |
| Overlap and policy checks | Must Have | API is the source of truth. The form can warn early |
| Approve my own request | Forbidden | Even if the person also has an admin role |

### B. Leave balance

Allocated, used, pending, approved, and remaining, by leave type, for the leave year. There is no balance table. The API derives this from entitlements and requests. The leave year defaults to the academic year and is **School-configured**.

If the API cannot return a balance, the cards show labeled mock numbers or an empty state. They are not described as the teacher’s real entitlement.

### C. Leave history

Every application for this teacher: type, dates, days, applied-on, reason, status, approver remarks, whether a file is attached, and a reference when the API has one. Search, filter, and sort. Open a row for the full record. Cancel or withdraw only when status and school policy allow it.

### D. Approval status

Pending, approved, rejected, and cancelled or withdrawn. Submission and decision times. Approver name when the school allows it. Remarks and, when the API provides one, a short timeline. The teacher can see the state without asking an administrator.

### E. Holiday and leave calendar

School and public holidays, this teacher’s approved leave, and this teacher’s pending requests. Month view and a list of upcoming dates. Approved, pending, and holiday use different labels, not colour alone. School events can appear when Module 14 has them. This calendar is the leave calendar. The school calendar remains Module 14.

### F. Substitute arrangements

For a pending or approved request, list affected date, period, class, section, subject, and room when the timetable can supply them. Show substitute status: Not required, Pending, or Assigned, plus the assigned teacher’s name when one exists. The teacher can read changes. The teacher cannot assign or replace a substitute unless a future permission says so. Default: view only. Allocation stays with the administrator. Substitute storage is a **schema gap**, so this panel is mock until that model exists.

### G. Further leave features

| Feature | Priority | Tags |
| --- | --- | --- |
| Policy and leave-type information | Must Have | Read-only, from the school |
| Upcoming approved leave | Must Have | |
| Notifications when a request changes | Must Have | Module 17. Mock until notifications exist |
| Amend an open request | Should Have | Only while policy allows |
| Personal leave report | Should Have | This teacher only |
| Download or print one application | Should Have | When the API can render it. Otherwise the detail view is the record |
| Empty, loading, error, and success states | Must Have | |

### Teacher actions

Apply, review the calculated duration, submit or save a draft, open history, filter it, cancel when allowed, read the decision, and open substitute status.

### Permissions

`teacher.leave.apply` and `teacher.leave.view` for the signed-in staff member only. There is no `teacher.leave.approve` and no `teacher.leave.assign_substitute`.

### Admin responsibilities

Leave types, paid flag, entitlement, approval chain, decisions, remarks, and substitute allocation.

### Access

A teacher sees only their own requests. They do not see the staff approval queue. Payroll effects of unpaid leave are not shown. Colleague leave is a **Future Enhancement** and off by default.

---

## 22. Module 14 — Calendar and Events

**Priority:** Must Have for holidays and the teacher’s own deadlines. Should Have for the full event mix.  
**Route:** `/app/calendar`  
**Purpose:** One school calendar for this teacher, without letting them rewrite school-wide events.

### Features

Academic calendar, holidays, exams, parent-teacher meetings, staff meetings, school events, assignment deadlines, lesson-plan dates, approved leave, and substitute events when those sources exist. Month, week, and agenda views. A personal reminder is **Should Have** and stays private to the teacher. Opening an item shows its detail. Editing a school event is **Admin-only**.

### Permissions

`teacher.calendar.view`. `teacher.calendar.reminder` for personal reminders only.

### Dependencies

`holidays` can back the holiday layer. Meetings, personal reminders, and a unified event feed are **API required** or a schema gap. Until then, holidays can be real and other layers are labeled fixtures.

---

## 23. Module 15 — My Profile

**Priority:** Must Have  
**Route:** `/app/profile`  
**Purpose:** Show the teacher their own professional record and protect the sign-in.

### Features

| Feature | Priority | Tags |
| --- | --- | --- |
| Photo, name, employee ID, designation, department | Must Have | Read-only where HR owns the field |
| Qualifications, experience, contact, emergency contact | Should Have | Shown when `staff` or a related API provides them. Missing fields stay blank, not invented |
| Assigned subjects and classes | Must Have | From the teaching load |
| Account email | Must Have | Masked where appropriate |
| Change password and active sessions | Must Have | API: required. Logout already exists |
| Profile update request when direct edit is locked | Should Have | Admin applies the change |
| Notification preferences | Future Enhancement | Schema gap |
| Salary, appraisal files, disciplinary files | Admin-only | Never on this page |

Sign-in is email and password for a user with the teacher role and an active staff link. The parent Firebase endpoint is not the teacher login. A successful admin password does not enter this portal. Forgot-password and change-password endpoints do not exist yet, so those screens explain that the school has not connected them. They do not pretend an email was sent.

### Permissions

`teacher.profile.view`, `teacher.profile.update_contact` when the school allows phone or photo edits, `teacher.account.password`

### Admin responsibilities

Create the user, link staff, deactivate, and apply profile-change requests.

---

## 24. Module 16 — Reports and Analytics

**Priority:** Should Have, with richer comparisons in Phase 3.  
**Route:** `/app/reports`  
**Purpose:** Give the teacher reports of their own classes only.

### Features

Student attendance, class performance, subject results, homework completion, syllabus completion, exam analysis, student progress, and lesson-plan completion. Filters for date, class, section, subject, and exam. Export to PDF or Excel and print are **Should Have** only when a report endpoint exists. Until then the on-screen table is the report, and export is disabled with an explanation.

### Permissions

`teacher.reports.view_own`

### Access

Aggregates use only rows inside the assignment boundary. The API must not return school-wide totals that reveal another class. Custom report builders and other teachers’ results are **Admin-only**.

---

## 25. Module 17 — Notifications and Reminders

**Priority:** Must Have  
**Route:** header bell and `/app/notifications`  
**Purpose:** Tell the teacher what changed, and take them to the record.

### Features

Announcements, homework due, homework waiting for review, marks deadlines, timetable changes, leave updates, substitute updates, meetings, exams, and lesson-plan decisions. Unread count, mark read, and mark all read when the API supports a bulk update. History and a link to the module. The bell is not a second copy of the message composer.

### Permissions

`teacher.communication.read`

### Dependencies

`notifications.read_at` can store a read time. A teacher-scoped feed is **API required**. Mock notifications are labeled and are not described as school pushes.

---

## 26. Module 18 — Help and Support

**Priority:** Should Have  
**Route:** `/app/help`  
**Purpose:** Give the teacher a way to ask for help without pretending a ticket system already exists.

### Features

FAQs and a short user guide can ship as static content. Raise a ticket, category, priority, attachments, status, and replies are **Mock until API**. There is no ticket table in the confirmed teacher model. Submit shows a confirmation that the request stayed in the browser demonstration, or, later, that the school accepted a ticket id. Contact details for the school office are read-only configuration, not a live chat.

### Permissions

`teacher.help.view`. Creating a real ticket waits on `teacher.help.create` and an API.

### Admin responsibilities

Own the future ticket queue. This portal does not assign or close school tickets.

---

## 27. Product additions that are not extra modules

| Addition | Where it lives | Priority |
| --- | --- | --- |
| Global search | Header | Must Have, limited to authorized records |
| Breadcrumbs, page titles, primary actions | Inner pages | Must Have |
| Reusable table, filter, pagination, dialog, drawer, date range | Shared UI | Must Have |
| Confirmation and toast | Shared UI | Must Have |
| Skeleton, empty, error, permission-denied | Every module | Must Have |
| Sort on wide tables | Lists | Should Have |
| Audit history of a submission | The record’s detail, when the API returns it | Should Have |

These are not new products. A control is added when a module needs it.

---

## 28. Admin work this portal depends on

| Prerequisite | Why |
| --- | --- |
| School, active year, timezone | Every list is year-scoped |
| Classes, sections, subjects, class-subjects | Teaching scope |
| Staff profile, teacher role, password | Sign-in |
| Teacher-subject assignments | The assignment boundary |
| Class-teacher designation | Attendance write and class remarks |
| Published timetable | Dashboard and timetable |
| Enrolled students | Directory |
| Holiday calendar and leave types | Calendar and leave |
| Attendance statuses and edit window | Attendance |
| Exam, max marks, scale, entry window | Marks |
| Communication channels | Messages |
| Document types | Profile files and resources |

Admin screens that are still shells are not treated as working APIs.

---

## 29. School-configuration catalogue

| Setting | Default | Affects |
| --- | --- | --- |
| Teacher portal enabled | Off until go-live | Sign-in |
| Previous years visible | Current year only | History |
| Class teacher marks daily attendance | On, once designation exists | Attendance |
| Subject teacher attendance | View only | Attendance |
| Attendance edit window | Until the end of that school day | Attendance |
| Bulk “all present” | On | Attendance |
| Homework needs admin approval | Off | Homework |
| Co-teachers may edit each other’s tasks | Off | Homework |
| Leave year | Academic year | Leave |
| Half-day leave | Off until the schema supports it | Leave |
| Teachers send class announcements | Off | Messages |
| Teachers message guardians | Off | Messages |
| Who may message | Class teachers only | Messages |
| Show guardian phone and email | Off | Students, messages |
| Teachers export a class roll or report | Off | Classes, reports |
| Show school-average comparison | Off | Performance, reports |
| Lesson plans require approval | Off | Lessons |
| Subject teachers may record discipline notes | Off | Behaviour |
| Question-paper upload by teachers | Off | Exams |
| Teachers assign substitutes | Off | Leave |

---

## 30. API readiness

### 30.1 Endpoints that exist today

| Endpoint | Use | Gap |
| --- | --- | --- |
| `POST /api/v1/auth/login` | Teacher password sign-in | Specified for admin. Must reject non-teachers and users with no active staff link, and must return a teacher context. |
| `POST /api/v1/auth/refresh` | Session continuity | Must keep teacher scope. |
| `POST /api/v1/auth/logout` | Sign out | Exists. |
| `POST /api/v1/auth/firebase` | Not for teachers | Parent channel. |
| Upload presign and upload | Homework, leave proof, photo, resources | No teacher authorization documented. MIME list is images and PDF. |

There is no password-change, forgot-password, session-list, or teacher-profile endpoint.

### 30.2 Schema ready, API required

Profile, teaching load, timetable, student directory, daily attendance view, homework, exams and marks, published report cards, leave apply and history, inbox and notifications, one-way guardian messages, employment documents, and own academic aggregates.

Every list applies school id, staff id, and the Section 5 scope. Filters may narrow scope. They must not widen it.

### 30.3 Schema gaps

| Needed record | Blocks |
| --- | --- |
| Class teacher per section per year | Attendance write, class remarks, default parent-message rights |
| Substitution | Cover schedule and temporary access |
| Syllabus, topic, coverage, lesson plan | Modules 4 and 9 |
| Class resource link | Module 10 |
| Teacher behaviour note | Module 11 |
| Half-day leave | Half-day applications |
| Message thread and notification preferences | Two-way chat and preference centre |
| Exam-paper max marks once per paper, and an absent status | Safe marks entry |
| Staff self-attendance | Module 2, My attendance |
| Support ticket | Module 18 beyond static help |
| Personal reminder and a unified event type | Full calendar |
| Appraisal released to staff | Honest self-view inside reports |

---

## 31. Proposed teacher permissions

The UI may hide an action when the code is missing. The API still checks the code and the assignment boundary.

| Code | Allows |
| --- | --- |
| `teacher.portal.access` | Sign in to this portal |
| `teacher.dashboard.view` | Dashboard |
| `teacher.profile.view` | Own profile |
| `teacher.profile.update_contact` | Phone and photo, if the school allows |
| `teacher.load.view` | Own classes, subjects, and curriculum list |
| `teacher.timetable.view` | Own timetable |
| `teacher.students.view` | Students inside scope |
| `teacher.attendance.view` | Student attendance inside scope |
| `teacher.attendance.mark` | Daily mark for designated class-teacher sections |
| `teacher.attendance.self.view` | Own staff attendance, when HR provides it |
| `teacher.homework.manage` | Own tasks and feedback |
| `teacher.communication.read` | Inbox, bell, and notification page |
| `teacher.account.password` | Password and own sessions, when those endpoints exist |
| `teacher.leave.view` | Own leave |
| `teacher.leave.apply` | Own applications |
| `teacher.calendar.view` | School calendar layers the teacher may see |
| `teacher.communication.send_class` | Class announcement, when enabled |
| `teacher.parents.message` | Guardian message, when enabled |
| `teacher.curriculum.update` | Topic completion, when enabled |
| `teacher.lessons.manage` | Lesson plans |
| `teacher.exams.marks.enter` | Open papers in scope |
| `teacher.performance.view` | In-scope progress |
| `teacher.report_cards.remark` | Class-teacher remark |
| `teacher.resources.manage` | Class resources |
| `teacher.behaviour.record` | Authorized notes |
| `teacher.reports.view_own` | Own reports |
| `teacher.help.view` | Help content |

No teacher permission grants user management, school settings, fee access, `leave.approve`, substitute assignment, `exams.publish`, or `report_cards.publish`.

---

## 32. Acceptance for the first teaching release

Against the real API, a teacher can:

1. Sign in only as a teacher with an active staff profile, land on **Dashboard**, and sign out.
2. See only their periods, classes, subjects, and enrolled students.
3. Open a student profile that hides fees, health, admission files, and, by default, guardian phone and email.
4. View student attendance, and mark it only when they are the designated class teacher.
5. Create and review homework for an assigned subject.
6. Read announcements and notifications addressed to them.
7. Open Leave, see their own requests, and be unable to approve leave or assign a substitute.
8. Fail closed on a direct link to another section, student, mark book, or staff profile.

Leave, lessons, marks, behaviour, resources, and help may be visible before their APIs exist. In that state they show labeled mock data or a clear unavailable state, and they do not report a successful save to the school.

---

## 33. Open decisions

| # | Decision | Recommendation |
| --- | --- | --- |
| 1 | One class teacher per section, or joint class teachers? | One active class teacher. |
| 2 | May a subject teacher mark daily attendance when no class teacher is set? | No. An administrator marks that section. |
| 3 | May subject teachers message guardians? | No, until the school turns the channel on for class teachers first. |
| 4 | Are guardian phone numbers visible? | No. |
| 5 | Is teacher login the admin password endpoint with a role check? | Yes. Do not use the parent Firebase path. |
| 6 | Must homework be approved before students see it? | No. |
| 7 | Which leave year is shown? | The active academic year. |
| 8 | May teachers download a class roll? | No in the first release. |
| 9 | Do all 18 modules stay visible before their APIs exist? | Yes. Writes stay disabled or explicitly mock. |
| 10 | Who allocates substitutes? | The administrator. Teachers view status only. |

---

## 34. Document history

| Version | Date | Notes |
| --- | --- | --- |
| 0.1 | 21 October 2026 | Initial 15-module requirements from the Admin Portal and the School ERP database. |
| 0.2 | 21 October 2026 | Revised to 18 modules. Dashboard replaces Home. Leave is a first-class module. Navigation is grouped to avoid duplicate items. Mock work is separated from live school data. No application code in this revision. |
