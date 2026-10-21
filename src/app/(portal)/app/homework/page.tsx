import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { HomeworkListPage } from "@/features/homework/HomeworkListPage";

export default function Page() {
  return (
    <SuspendedPage>
      <HomeworkListPage />
    </SuspendedPage>
  );
}
