import { Badge } from "@/components/ui/Badge";

export function AvailabilityBadge({ available }: { available: boolean }) {
  return <Badge variant={available ? "success" : "danger"}>{available ? "Available" : "Unavailable"}</Badge>;
}
