export interface SubjectPaper {
  id: string;
  subject: string;
  examType: string;
  maxMarks: number;
  theoryMax?: number;
  practicalMax?: number;
}

export interface ClassSubjectMap {
  id: string;
  grade: string;
  label: string;
  section: string;
  papers: SubjectPaper[];
}

export const CLASS_SUBJECTS: ClassSubjectMap[] = [
  {
    id: "6a",
    grade: "6",
    label: "Class 6",
    section: "A",
    papers: [
      { id: "6-math", subject: "Mathematics", examType: "Term assessment", maxMarks: 100 },
      { id: "6-eng", subject: "English", examType: "Term assessment", maxMarks: 80 },
      { id: "6-sci", subject: "Science", examType: "Term assessment", maxMarks: 100 },
    ],
  },
  {
    id: "7b",
    grade: "7",
    label: "Class 7",
    section: "B",
    papers: [
      { id: "7-math", subject: "Mathematics", examType: "Term assessment", maxMarks: 100 },
      { id: "7-eng", subject: "English", examType: "Term assessment", maxMarks: 80 },
    ],
  },
  {
    id: "8a",
    grade: "8",
    label: "Class 8",
    section: "A",
    papers: [
      { id: "8-math", subject: "Mathematics", examType: "Term assessment", maxMarks: 100 },
      { id: "8-sci", subject: "Science", examType: "Term assessment", maxMarks: 80 },
      { id: "8-sst", subject: "Social Science", examType: "Term assessment", maxMarks: 80 },
    ],
  },
  {
    id: "9a",
    grade: "9",
    label: "Class 9",
    section: "A",
    papers: [
      { id: "9-math", subject: "Mathematics", examType: "Board-style paper", maxMarks: 100, theoryMax: 80, practicalMax: 20 },
      { id: "9-eng", subject: "English", examType: "Board-style paper", maxMarks: 80 },
      { id: "9-sci", subject: "Science", examType: "Board-style paper", maxMarks: 100, theoryMax: 70, practicalMax: 30 },
    ],
  },
  {
    id: "10a",
    grade: "10",
    label: "Class 10",
    section: "A",
    papers: [
      { id: "10-math", subject: "Mathematics", examType: "Board paper", maxMarks: 100, theoryMax: 80, practicalMax: 20 },
      { id: "10-eng", subject: "English", examType: "Board paper", maxMarks: 80 },
      { id: "10-sci", subject: "Science", examType: "Board paper", maxMarks: 100, theoryMax: 70, practicalMax: 30 },
      { id: "10-sst", subject: "Social Science", examType: "Board paper", maxMarks: 80 },
    ],
  },
  {
    id: "12a",
    grade: "12",
    label: "Class 12",
    section: "A",
    papers: [
      { id: "12-math", subject: "Mathematics", examType: "Board paper", maxMarks: 100, theoryMax: 80, practicalMax: 20 },
      { id: "12-phy", subject: "Physics", examType: "Board paper", maxMarks: 100, theoryMax: 70, practicalMax: 30 },
      { id: "12-che", subject: "Chemistry", examType: "Board paper", maxMarks: 100, theoryMax: 70, practicalMax: 30 },
      { id: "12-eng", subject: "English", examType: "Board paper", maxMarks: 80 },
    ],
  },
];

export function papersForClass(classId: string) {
  return CLASS_SUBJECTS.find((item) => item.id === classId)?.papers ?? [];
}
