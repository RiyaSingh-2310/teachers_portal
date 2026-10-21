import type { HomeworkStatus } from "@/types/domain";

export function homeworkStatusLabel(status: HomeworkStatus | "needs-review" | "all") {
  if (status === "all") return "All";
  if (status === "needs-review") return "Needs review";
  if (status === "PUBLISHED") return "Published";
  if (status === "DRAFT") return "Draft";
  return "Closed";
}
