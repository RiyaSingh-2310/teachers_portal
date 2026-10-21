import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { MessagesPage } from "@/features/messages/MessagesPages";

export default function Page() {
  return (
    <SuspendedPage>
      <MessagesPage />
    </SuspendedPage>
  );
}
