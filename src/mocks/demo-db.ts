import { buildAnnouncements, buildExams, buildHomework, buildStudents, buildSubmissions, DEVICES, DOCUMENTS, withOpenHomework } from "@/mocks/fixture";
import type {
  Announcement,
  DeviceSession,
  ExamSitting,
  HomeworkTask,
  StudentSummary,
  Submission,
  TeacherProfile,
} from "@/types/domain";

export interface DemoDatabase {
  students: StudentSummary[];
  homework: HomeworkTask[];
  submissions: Submission[];
  announcements: Announcement[];
  exams: ExamSitting[];
  sessions: DeviceSession[];
  profile: TeacherProfile;
}

function createDatabase(): DemoDatabase {
  const now = new Date();
  const homework = buildHomework(now);
  const rawStudents = buildStudents();
  const submissions = buildSubmissions(rawStudents, homework, now);
  const students = withOpenHomework(rawStudents, homework, submissions);
  return {
    students,
    homework,
    submissions,
    announcements: buildAnnouncements(now),
    exams: buildExams(now),
    sessions: DEVICES.map((device) => ({ ...device })),
    profile: {
      displayName: "Meera Iyer",
      designation: "Mathematics Teacher",
      employeeNumber: "T-0142",
      email: "meera.iyer@spdf.school",
      phone: "98450 01420",
      photoUrl: null,
      joiningDate: "10 June 2019",
      department: "Mathematics",
      departmentPrimary: true,
      status: "Active",
      documents: DOCUMENTS.map((document) => ({ ...document })),
    },
  };
}

let database = createDatabase();
const listeners = new Set<() => void>();

export function getDemoDatabase() {
  return database;
}

export function updateDemoDatabase(recipe: (draft: DemoDatabase) => void) {
  const next: DemoDatabase = {
    ...database,
    students: database.students.map((student) => ({ ...student })),
    homework: database.homework.map((task) => ({ ...task })),
    submissions: database.submissions.map((row) => ({ ...row })),
    announcements: database.announcements.map((item) => ({ ...item })),
    exams: database.exams.map((exam) => ({ ...exam })),
    sessions: database.sessions.map((session) => ({ ...session })),
    profile: {
      ...database.profile,
      documents: database.profile.documents.map((document) => ({ ...document })),
    },
  };
  recipe(next);
  next.students = withOpenHomework(next.students, next.homework, next.submissions);
  database = next;
  listeners.forEach((listener) => listener());
}

export function subscribeDemoDatabase(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
