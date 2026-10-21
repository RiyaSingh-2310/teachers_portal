export type TeacherPermission =
  | "teacher.portal.access"
  | "teacher.dashboard.view"
  | "teacher.profile.view"
  | "teacher.profile.update_contact"
  | "teacher.load.view"
  | "teacher.timetable.view"
  | "teacher.students.view"
  | "teacher.attendance.view"
  | "teacher.homework.manage"
  | "teacher.communication.read"
  | "teacher.account.password";

export interface DemoSession {
  kind: "ui-demonstration";
  staffId: string;
  schoolId: string;
  email: string;
  displayName: string;
  firstName: string;
  role: "TEACHER";
  phase: 1 | 2 | 3;
}

export interface TeachingAssignment {
  id: string;
  grade: string;
  gradeLabel: string;
  section: string;
  subject: string;
  isPrimary: boolean;
  role: "Lead" | "Co-teacher";
  studentCount: number;
  periodsPerWeek: number;
}

export interface PeriodSlot {
  id: string;
  date: string;
  weekday: string;
  period: number;
  start: string;
  end: string;
  assignmentId: string;
  gradeLabel: string;
  section: string;
  subject: string;
  room: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface StudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  rollNumber: string;
  grade: string;
  gradeLabel: string;
  section: string;
  assignmentId: string;
  subject: string;
  attendancePercent: number;
  openHomework: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  sender: string;
  sentAt: string;
  category: "announcement" | "alert";
  unread: boolean;
  href?: string;
}

export type HomeworkStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface HomeworkTask {
  id: string;
  title: string;
  instructions: string;
  assignmentId: string;
  gradeLabel: string;
  section: string;
  subject: string;
  dueAt: string | null;
  status: HomeworkStatus;
}

export type SubmissionStatus = "NOT_SUBMITTED" | "SUBMITTED" | "RETURNED";

export interface Submission {
  homeworkId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  score: number | null;
  maxScore: number;
  feedback: string;
}

export interface ExamSitting {
  id: string;
  examName: string;
  gradeLabel: string;
  section: string;
  subject: string;
  startsAt: string;
  room: string;
  entryOpen: boolean;
}

export interface DeviceSession {
  id: string;
  device: string;
  lastSeen: string;
  current: boolean;
}

export interface StaffDocument {
  id: string;
  name: string;
  type: string;
  status: "VERIFIED" | "PENDING";
}

export interface PageResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TeacherProfile {
  displayName: string;
  designation: string;
  employeeNumber: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  joiningDate: string;
  department: string;
  departmentPrimary: boolean;
  status: "Active";
  documents: StaffDocument[];
}
