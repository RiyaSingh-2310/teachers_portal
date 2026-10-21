import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { HomeworkDetailPage } from "@/features/homework/HomeworkDetailPage";

export default function Page() {
  return (
    <SuspendedPage>
      <HomeworkDetailPage />
    </SuspendedPage>
  );
}
