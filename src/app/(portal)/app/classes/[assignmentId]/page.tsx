import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { ClassDetailPage } from "@/features/classes/ClassDetailPage";

export default function Page() {
  return (
    <SuspendedPage>
      <ClassDetailPage />
    </SuspendedPage>
  );
}
