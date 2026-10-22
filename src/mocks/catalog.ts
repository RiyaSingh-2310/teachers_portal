export const LEAVE_TYPES = [
  { id: "casual", name: "Casual leave", allocated: 8 },
  { id: "sick", name: "Sick leave", allocated: 6 },
  { id: "earned", name: "Earned leave", allocated: 12 },
] as const;

export const SYLLABUS = [
  { id: "ch1", chapter: "Linear equations", topics: 6, done: 5, objective: "Solve one-variable equations and check the result." },
  { id: "ch2", chapter: "Graphs", topics: 4, done: 2, objective: "Plot and interpret a straight-line graph." },
  { id: "ch3", chapter: "Fractions", topics: 5, done: 3, objective: "Find a fraction of a quantity." },
  { id: "ch4", chapter: "Angles", topics: 4, done: 1, objective: "Name and calculate missing angles." },
];

export const EXAM_PAPERS = [
  { id: "term1-8a", name: "Term 1", grade: "Grade 8 A", subject: "Mathematics", when: "Mon 2 Nov, 09:00", room: "Hall B", maxTheory: 80, maxPractical: 20, status: "Entry open" },
  { id: "term1-7b", name: "Term 1", grade: "Grade 7 B", subject: "Mathematics", when: "Tue 3 Nov, 09:00", room: "Hall B", maxTheory: 80, maxPractical: 0, status: "Scheduled" },
  { id: "retest-8a", name: "Improvement", grade: "Grade 8 A", subject: "Mathematics", when: "Fri 20 Nov, 09:00", room: "Room 12", maxTheory: 40, maxPractical: 0, status: "Not open" },
];

export const MARK_ROWS = [
  { id: "stu-8a-math-08", name: "Aanya Shah", roll: "08" },
  { id: "stu-8a-math-14", name: "Kabir Menon", roll: "14" },
  { id: "stu-8a-math-19", name: "Diya Nair", roll: "19" },
];

export const PERFORMANCE = [
  { name: "Aanya Shah", attendance: 96, homework: 100, exam: 84, support: "On track" },
  { name: "Kabir Menon", attendance: 88, homework: 60, exam: 71, support: "Extra practice with equations" },
  { name: "Diya Nair", attendance: 91, homework: 80, exam: 76, support: "Check graph plotting" },
];

export const RESOURCES = [
  { id: "r1", title: "Linear equations notes", kind: "PDF", chapter: "Linear equations", shared: true },
  { id: "r2", title: "Graph paper worksheet", kind: "Image", chapter: "Graphs", shared: false },
  { id: "r3", title: "Angle facts reference", kind: "Link", chapter: "Angles", shared: true },
];

export const BEHAVIOUR = [
  { id: "b1", student: "Kabir Menon", date: "18 Oct 2026", category: "Positive achievement", note: "Explained a method clearly to a partner.", followUp: "None" },
  { id: "b2", student: "Diya Nair", date: "14 Oct 2026", category: "Participation", note: "Asked for a second example before starting the exercise.", followUp: "Offer a worked example next lesson" },
];

export const EVENTS = [
  { date: "2026-10-02", label: "Gandhi Jayanti", kind: "Holiday" },
  { date: "2026-10-29", label: "Staff meeting", kind: "Meeting" },
  { date: "2026-11-02", label: "Term 1 Mathematics, Grade 8 A", kind: "Exam" },
  { date: "2026-11-06", label: "Parent-teacher meeting", kind: "Meeting" },
  { date: "2026-11-12", label: "Fractions worksheet due", kind: "Deadline" },
];

export const NOTIFICATIONS = [
  { id: "n1", title: "Homework waiting for review", body: "12 submissions on the fractions worksheet.", href: "/app/homework?status=needs-review", unread: true },
  { id: "n2", title: "Marks window opens 2 Nov", body: "Term 1 Mathematics for Grade 8 A.", href: "/app/exams", unread: true },
  { id: "n3", title: "Leave request LV-1042", body: "Sample request is still pending. This is not a school decision.", href: "/app/leave", unread: false },
  { id: "n4", title: "Timetable unchanged", body: "No cover has been published for your periods this week.", href: "/app/timetable", unread: false },
];

export const SUBSTITUTES = [
  { date: "2026-11-16", period: "P1", className: "Grade 8 A", subject: "Mathematics", room: "12", teacher: "Not assigned", status: "Pending" },
  { date: "2026-11-16", period: "P2", className: "Grade 8 A", subject: "Mathematics", room: "12", teacher: "Anita Rao", status: "Assigned" },
  { date: "2026-10-24", period: "P6", className: "Grade 8 B", subject: "Mathematics", room: "12", teacher: "—", status: "Not required" },
];

export const STAFF_ATTENDANCE = [
  { month: "October 2026", present: 14, absent: 0, late: 1, leave: 1, percent: 93 },
];

export const SHORT_ATTENDANCE = [
  { name: "Dev Iyer", className: "Grade 8 A", percent: 80 },
  { name: "Amaira Patel", className: "Grade 8 A", percent: 81 },
];
