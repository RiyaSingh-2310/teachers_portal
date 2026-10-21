import { SuspendedPage } from "@/components/layout/SuspendedPage";
import { MessageDetailPage } from "@/features/messages/MessagesPages";

export default function Page() {
  return (
    <SuspendedPage>
      <MessageDetailPage />
    </SuspendedPage>
  );
}
