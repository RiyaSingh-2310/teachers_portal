import { format, parseISO } from "date-fns";
import { HOLIDAYS, periodsForDate, ASSIGNMENTS } from "@/mocks/fixture";
import { getDemoDatabase, updateDemoDatabase } from "@/mocks/demo-db";
import { PortalError } from "@/lib/api/errors";
import { paginate, wait } from "@/lib/utils";
import type {
  HomeworkQuery,
  MessageQuery,
  PortalRepository,
  StudentQuery,
} from "@/repositories/types";
import type { AttendanceStatus, HomeworkTask, Submission } from "@/types/domain";

function counts(homeworkId: string) {
  const rows = getDemoDatabase().submissions.filter((row) => row.homeworkId === homeworkId);
  return {
    studentCount: rows.length,
    submitted: rows.filter((row) => row.status !== "NOT_SUBMITTED").length,
    returned: rows.filter((row) => row.status === "RETURNED").length,
    unreviewed: rows.filter((row) => row.status === "SUBMITTED").length,
  };
}

function decorate(task: HomeworkTask) {
  return { ...task, ...counts(task.id) };
}

function statusFor(roll: string, date: string): AttendanceStatus {
  const seed = Number(roll) + date.split("-").reduce((sum, part) => sum + Number(part), 0);
  const bucket = seed % 20;
  if (bucket === 0) return "ABSENT";
  if (bucket === 1) return "LATE";
  if (bucket === 2) return "EXCUSED";
  return "PRESENT";
}

export const mockPortalRepository: PortalRepository = {
  async getDashboard() {
    await wait();
    const db = getDemoDatabase();
    const today = format(new Date(), "yyyy-MM-dd");
    const unreviewedSubmissions = db.submissions.filter((row) => row.status === "SUBMITTED").length;
    return {
      periods: periodsForDate(parseISO(today)),
      assignments: ASSIGNMENTS,
      unreadMessages: db.announcements.filter((item) => item.unread).length,
      unreviewedSubmissions,
      announcements: db.announcements.slice(0, 3),
      exams: db.exams,
      attendance: ASSIGNMENTS.map((assignment) => {
        const students = db.students.filter((student) => student.assignmentId === assignment.id);
        const average = Math.round(
          students.reduce((sum, student) => sum + student.attendancePercent, 0) / students.length,
        );
        return {
          assignmentId: assignment.id,
          label: `${assignment.gradeLabel} ${assignment.section}`,
          presentPercent: average,
        };
      }),
    };
  },

  async listAssignments(search?: string) {
    await wait();
    const query = search?.trim().toLowerCase() ?? "";
    return ASSIGNMENTS.filter((assignment) => {
      if (!query) return true;
      return `${assignment.gradeLabel} ${assignment.section} ${assignment.subject}`
        .toLowerCase()
        .includes(query);
    });
  },

  async getAssignment(id: string) {
    await wait(120);
    return ASSIGNMENTS.find((assignment) => assignment.id === id) ?? null;
  },

  async getDay(date: string) {
    await wait(120);
    const parsed = parseISO(date);
    return {
      holiday: HOLIDAYS[date] ?? null,
      periods: periodsForDate(parsed),
    };
  },

  async getWeek(monday: string) {
    await wait();
    const start = parseISO(monday);
    const slots = [];
    for (let index = 0; index < 5; index += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      slots.push(...periodsForDate(day));
    }
    return slots;
  },

  async listStudents(query: StudentQuery) {
    await wait();
    const needle = query.search?.trim().toLowerCase() ?? "";
    const filtered = getDemoDatabase().students.filter((student) => {
      if (query.grade && query.grade !== "all" && student.grade !== query.grade) return false;
      if (query.section && query.section !== "all" && student.section !== query.section) return false;
      if (!needle) return true;
      return (
        student.name.toLowerCase().includes(needle) ||
        student.rollNumber.includes(needle)
      );
    });
    filtered.sort((a, b) => a.grade.localeCompare(b.grade) || a.section.localeCompare(b.section) || Number(a.rollNumber) - Number(b.rollNumber));
    return paginate(filtered, query.page, query.limit);
  },

  async getStudent(id: string) {
    await wait(120);
    return getDemoDatabase().students.find((student) => student.id === id) ?? null;
  },

  async getRegister(assignmentId: string, date: string) {
    await wait();
    const assignment = ASSIGNMENTS.find((item) => item.id === assignmentId);
    if (!assignment) return null;
    const rows = getDemoDatabase()
      .students.filter((student) => student.assignmentId === assignmentId)
      .map((student) => ({
        studentId: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: statusFor(student.rollNumber, date),
      }));
    return {
      assignmentId,
      date,
      canMark: false as const,
      reason:
        "Daily attendance is marked by the class teacher. That duty is not assigned in this portal yet. This register is a design fixture.",
      rows,
    };
  },

  async listHomework(query: HomeworkQuery) {
    await wait();
    const needle = query.search?.trim().toLowerCase() ?? "";
    const items = getDemoDatabase()
      .homework.filter((task) => {
        if (query.assignmentId && query.assignmentId !== "all" && task.assignmentId !== query.assignmentId) {
          return false;
        }
        if (needle && !task.title.toLowerCase().includes(needle)) return false;
        const decorated = decorate(task);
        if (query.status === "needs-review") return decorated.unreviewed > 0;
        if (query.status && query.status !== "all") return task.status === query.status;
        return true;
      })
      .map(decorate);
    return paginate(items, query.page, query.limit);
  },

  async getHomework(id: string) {
    await wait(120);
    const task = getDemoDatabase().homework.find((item) => item.id === id);
    return task ? decorate(task) : null;
  },

  async listSubmissions(homeworkId: string) {
    await wait();
    return getDemoDatabase()
      .submissions.filter((row) => row.homeworkId === homeworkId)
      .sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber));
  },

  async saveFeedback(homeworkId, studentId, score, feedback) {
    await wait(180);
    let saved: Submission | null = null;
    updateDemoDatabase((draft) => {
      const row = draft.submissions.find(
        (item) => item.homeworkId === homeworkId && item.studentId === studentId,
      );
      if (!row) return;
      row.score = score;
      row.feedback = feedback;
      row.status = "RETURNED";
      saved = { ...row };
    });
    if (!saved) {
      throw new PortalError("NOT_FOUND", "That submission is not in your classes.");
    }
    return saved;
  },

  async createHomework(input) {
    await wait(180);
    const task: HomeworkTask = {
      id: `hw-${Date.now()}`,
      title: input.title,
      instructions: input.instructions,
      assignmentId: input.assignmentId,
      gradeLabel: input.gradeLabel,
      section: input.section,
      subject: input.subject,
      dueAt: input.dueAt,
      status: input.publish ? "PUBLISHED" : "DRAFT",
    };
    updateDemoDatabase((draft) => {
      draft.homework = [task, ...draft.homework];
      const students = draft.students.filter((student) => student.assignmentId === task.assignmentId);
      for (const student of students) {
        draft.submissions.push({
          homeworkId: task.id,
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          status: "NOT_SUBMITTED",
          submittedAt: null,
          score: null,
          maxScore: 10,
          feedback: "",
        });
      }
    });
    return task;
  },

  async listMessages(query: MessageQuery) {
    await wait();
    const needle = query.search?.trim().toLowerCase() ?? "";
    const items = getDemoDatabase().announcements.filter((item) => {
      if (query.category === "unread" && !item.unread) return false;
      if (query.category === "announcement" && item.category !== "announcement") return false;
      if (query.category === "alert" && item.category !== "alert") return false;
      if (!needle) return true;
      return `${item.title} ${item.body}`.toLowerCase().includes(needle);
    });
    return paginate(items, query.page, query.limit);
  },

  async getMessage(id: string) {
    await wait(80);
    return getDemoDatabase().announcements.find((item) => item.id === id) ?? null;
  },

  async markMessageRead(id: string) {
    await wait(80);
    updateDemoDatabase((draft) => {
      const item = draft.announcements.find((message) => message.id === id);
      if (item) item.unread = false;
    });
  },

  async getProfile() {
    await wait(120);
    return getDemoDatabase().profile;
  },

  async updatePhone(phone: string) {
    await wait(160);
    updateDemoDatabase((draft) => {
      draft.profile.phone = phone;
    });
    return getDemoDatabase().profile;
  },

  async updatePhoto(dataUrl: string) {
    await wait(160);
    updateDemoDatabase((draft) => {
      draft.profile.photoUrl = dataUrl;
    });
    return getDemoDatabase().profile;
  },

  async listSessions() {
    await wait(80);
    return getDemoDatabase().sessions;
  },

  async revokeSession(id: string) {
    await wait(80);
    updateDemoDatabase((draft) => {
      draft.sessions = draft.sessions.filter((session) => session.id !== id || session.current);
    });
  },

  async listExams() {
    await wait();
    return getDemoDatabase().exams;
  },
};
