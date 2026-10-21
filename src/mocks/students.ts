import type { StudentSummary } from "@/types/domain";
import { ASSIGNMENTS } from "@/mocks/assignments";

const FIRST = [
  "Aanya",
  "Kabir",
  "Diya",
  "Arjun",
  "Sara",
  "Noah",
  "Meher",
  "Vivaan",
  "Anika",
  "Reyansh",
  "Ishaan",
  "Myra",
  "Advait",
  "Kiara",
  "Shaurya",
  "Inaaya",
  "Krish",
  "Amaira",
  "Dev",
  "Zara",
  "Aarav",
  "Navya",
  "Yusuf",
  "Lara",
  "Om",
  "Sana",
  "Harsh",
  "Pari",
  "Neil",
  "Tara",
  "Rohan",
  "Aisha",
];

const LAST = [
  "Shah",
  "Menon",
  "Nair",
  "Patel",
  "Iqbal",
  "D'Souza",
  "Iyer",
  "Kapoor",
  "Reddy",
  "Gill",
  "Joshi",
  "Bose",
  "Khan",
  "Das",
  "Mehta",
  "Rao",
];

const NAMED: Record<string, { first: string; last: string; roll: string }[]> = {
  "8a-math": [
    { first: "Aanya", last: "Shah", roll: "08" },
    { first: "Kabir", last: "Menon", roll: "14" },
    { first: "Diya", last: "Nair", roll: "19" },
  ],
  "7b-math": [
    { first: "Arjun", last: "Patel", roll: "03" },
    { first: "Sara", last: "Iqbal", roll: "11" },
  ],
  "8b-math": [{ first: "Noah", last: "D'Souza", roll: "22" }],
};

function padRoll(n: number) {
  return String(n).padStart(2, "0");
}

export function buildStudents(): StudentSummary[] {
  const students: StudentSummary[] = [];
  for (const assignment of ASSIGNMENTS) {
    const named = NAMED[assignment.id] ?? [];
    const used = new Set(named.map((item) => item.roll));
    const rows: { first: string; last: string; roll: string }[] = [...named];
    let cursor = 1;
    while (rows.length < assignment.studentCount) {
      const roll = padRoll(cursor);
      cursor += 1;
      if (used.has(roll)) continue;
      const index = rows.length;
      rows.push({
        first: FIRST[index % FIRST.length],
        last: LAST[(index * 3) % LAST.length],
        roll,
      });
    }
    rows.sort((a, b) => Number(a.roll) - Number(b.roll));
    for (const row of rows) {
      const rollNumber = Number(row.roll);
      students.push({
        id: `stu-${assignment.id}-${row.roll}`,
        firstName: row.first,
        lastName: row.last,
        name: `${row.first} ${row.last}`,
        rollNumber: row.roll,
        grade: assignment.grade,
        gradeLabel: assignment.gradeLabel,
        section: assignment.section,
        assignmentId: assignment.id,
        subject: assignment.subject,
        attendancePercent: 80 + ((rollNumber * 7) % 18),
        openHomework: 0,
      });
    }
  }
  return students;
}
