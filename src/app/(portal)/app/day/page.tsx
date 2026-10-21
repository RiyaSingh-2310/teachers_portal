import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { DayPage } from "@/features/timetable/DayPage";

export default function Page() {
  return (
    <SuspendedPage>
      <DayPage />
    </SuspendedPage>
  );
}
