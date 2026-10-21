import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { StudentsPage } from "@/features/students/StudentsPage";

export default function Page() {
  return (
    <SuspendedPage>
      <StudentsPage />
    </SuspendedPage>
  );
}
