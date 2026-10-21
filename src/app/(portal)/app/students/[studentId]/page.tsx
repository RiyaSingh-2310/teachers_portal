import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { StudentDetailPage } from "@/features/students/StudentDetailPage";

export default function Page() {
  return (
    <SuspendedPage>
      <StudentDetailPage />
    </SuspendedPage>
  );
}
