import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { AttendancePage } from "@/features/attendance/AttendancePage";

export default function Page() {
  return (
    <SuspendedPage>
      <AttendancePage />
    </SuspendedPage>
  );
}
