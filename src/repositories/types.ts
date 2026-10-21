import type {
  Announcement,
  AttendanceStatus,
  DemoSession,
  DeviceSession,
  ExamSitting,
  HomeworkStatus,
  HomeworkTask,
  PageResult,
  PeriodSlot,
  StudentSummary,
  Submission,
  TeacherProfile,
  TeachingAssignment,
} from "@/types/domain";

export interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

export interface StudentQuery {
  search?: string;
  grade?: string;
  section?: string;
  page: number;
  limit: number;
}

export interface HomeworkQuery {
  search?: string;
  assignmentId?: string;
  status?: HomeworkStatus | "needs-review" | "all";
  page: number;
  limit: number;
}

export interface MessageQuery {
  search?: string;
  category?: "all" | "unread" | "announcement" | "alert";
  page: number;
  limit: number;
}

export interface AttendanceRow {
  studentId: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus;
}

export interface AttendanceRegister {
  assignmentId: string;
  date: string;
  canMark: false;
  reason: string;
  rows: AttendanceRow[];
}

export interface DashboardSnapshot {
  periods: PeriodSlot[];
  assignments: TeachingAssignment[];
  unreadMessages: number;
  unreviewedSubmissions: number;
  announcements: Announcement[];
  exams: ExamSitting[];
  attendance: { assignmentId: string; label: string; presentPercent: number }[];
}

export interface AuthRepository {
  login(input: LoginInput): Promise<DemoSession>;
  logout(): Promise<void>;
}

export interface PortalRepository {
  getDashboard(): Promise<DashboardSnapshot>;
  listAssignments(search?: string): Promise<TeachingAssignment[]>;
  getAssignment(id: string): Promise<TeachingAssignment | null>;
  getDay(date: string): Promise<{ holiday: string | null; periods: PeriodSlot[] }>;
  getWeek(monday: string): Promise<PeriodSlot[]>;
  listStudents(query: StudentQuery): Promise<PageResult<StudentSummary>>;
  getStudent(id: string): Promise<StudentSummary | null>;
  getRegister(assignmentId: string, date: string): Promise<AttendanceRegister | null>;
  listHomework(query: HomeworkQuery): Promise<PageResult<HomeworkTask & { submitted: number; returned: number; studentCount: number; unreviewed: number }>>;
  getHomework(id: string): Promise<(HomeworkTask & { submitted: number; returned: number; studentCount: number; unreviewed: number }) | null>;
  listSubmissions(homeworkId: string): Promise<Submission[]>;
  saveFeedback(homeworkId: string, studentId: string, score: number, feedback: string): Promise<Submission>;
  createHomework(input: Omit<HomeworkTask, "id" | "status"> & { publish: boolean }): Promise<HomeworkTask>;
  listMessages(query: MessageQuery): Promise<PageResult<Announcement>>;
  getMessage(id: string): Promise<Announcement | null>;
  markMessageRead(id: string): Promise<void>;
  getProfile(): Promise<TeacherProfile>;
  updatePhone(phone: string): Promise<TeacherProfile>;
  updatePhoto(dataUrl: string): Promise<TeacherProfile>;
  listSessions(): Promise<DeviceSession[]>;
  revokeSession(id: string): Promise<void>;
  listExams(): Promise<ExamSitting[]>;
}
