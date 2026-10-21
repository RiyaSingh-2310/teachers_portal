import { addDays, setHours, setMinutes } from "date-fns";
import type { HomeworkTask, StudentSummary, Submission } from "@/types/domain";

export function buildHomework(now: Date): HomeworkTask[] {
  const due = (dayOffset: number, hour: number, minute: number) =>
    setMinutes(setHours(addDays(now, dayOffset), hour), minute).toISOString();

  return [
    {
      id: "hw-linear",
      title: "Linear equations — practice set",
      instructions:
        "Complete questions 1 to 8 from the class notes. Show each transposition.",
      assignmentId: "8a-math",
      gradeLabel: "Grade 8",
      section: "A",
      subject: "Mathematics",
      dueAt: due(1, 16, 0),
      status: "PUBLISHED",
    },
    {
      id: "hw-graphs",
      title: "Graphs practice",
      instructions: "Plot the three linear graphs on squared paper.",
      assignmentId: "8a-math",
      gradeLabel: "Grade 8",
      section: "A",
      subject: "Mathematics",
      dueAt: due(3, 16, 0),
      status: "PUBLISHED",
    },
    {
      id: "hw-quiz",
      title: "Chapter 1 quiz",
      instructions: "Closed class quiz. Feedback is already returned.",
      assignmentId: "8a-math",
      gradeLabel: "Grade 8",
      section: "A",
      subject: "Mathematics",
      dueAt: due(-20, 16, 0),
      status: "CLOSED",
    },
    {
      id: "hw-fractions",
      title: "Fractions worksheet",
      instructions: "Finish the worksheet on fractions of a quantity.",
      assignmentId: "7b-math",
      gradeLabel: "Grade 7",
      section: "B",
      subject: "Mathematics",
      dueAt: due(0, 16, 0),
      status: "PUBLISHED",
    },
    {
      id: "hw-revision",
      title: "Revision notes (draft)",
      instructions: "Draft notes for the next Grade 8 B lesson. Not published.",
      assignmentId: "8b-math",
      gradeLabel: "Grade 8",
      section: "B",
      subject: "Mathematics",
      dueAt: null,
      status: "DRAFT",
    },
    {
      id: "hw-angles",
      title: "Angle facts worksheet",
      instructions: "Find the missing angles and name the reason.",
      assignmentId: "6a-math",
      gradeLabel: "Grade 6",
      section: "A",
      subject: "Mathematics",
      dueAt: due(2, 16, 0),
      status: "PUBLISHED",
    },
  ];
}

const OPEN_BY_STUDENT: Record<string, string[]> = {
  "stu-8a-math-14": ["hw-linear", "hw-graphs"],
  "stu-8a-math-19": ["hw-graphs"],
  "stu-7b-math-11": ["hw-fractions"],
};

export function buildSubmissions(
  students: StudentSummary[],
  homework: HomeworkTask[],
  now: Date,
): Submission[] {
  const submittedAt = addDays(now, -1).toISOString();
  const rows: Submission[] = [];

  for (const task of homework) {
    if (task.status === "DRAFT") continue;
    const roll = students.filter((student) => student.assignmentId === task.assignmentId);
    const fractionReview = new Set(
      roll
        .filter((student) => student.id !== "stu-7b-math-11")
        .slice(0, 12)
        .map((student) => student.id),
    );

    for (const student of roll) {
      const forcedOpen = OPEN_BY_STUDENT[student.id]?.includes(task.id) ?? false;
      let status: Submission["status"] = "NOT_SUBMITTED";
      if (task.id === "hw-fractions") {
        status = fractionReview.has(student.id) ? "SUBMITTED" : "NOT_SUBMITTED";
      } else if (task.status === "CLOSED") {
        status = "RETURNED";
      } else if (!forcedOpen && Number(student.rollNumber) % 2 === 0) {
        status = "RETURNED";
      } else if (!forcedOpen && task.id === "hw-linear") {
        status = "RETURNED";
      }

      if (forcedOpen) status = "NOT_SUBMITTED";

      rows.push({
        homeworkId: task.id,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        status,
        submittedAt: status === "NOT_SUBMITTED" ? null : submittedAt,
        score: status === "RETURNED" ? 8 : null,
        maxScore: 10,
        feedback: status === "RETURNED" ? "Marked in this demonstration." : "",
      });
    }
  }

  return rows;
}

export function withOpenHomework(
  students: StudentSummary[],
  homework: HomeworkTask[],
  submissions: Submission[],
): StudentSummary[] {
  const published = new Set(
    homework.filter((task) => task.status === "PUBLISHED").map((task) => task.id),
  );
  return students.map((student) => {
    const openHomework = submissions.filter(
      (row) =>
        row.studentId === student.id &&
        published.has(row.homeworkId) &&
        row.status === "NOT_SUBMITTED",
    ).length;
    return { ...student, openHomework };
  });
}
