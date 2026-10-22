"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MockCaption } from "@/components/ui/MockCaption";

const FAQS = [
  { q: "Who can see my classes?", a: "Only records linked to your teaching assignment. The Admin Portal is a separate sign-in." },
  { q: "Why can’t I mark attendance?", a: "The school has not stored a class-teacher assignment. The register can be reviewed, and a browser draft is not submitted to the school." },
  { q: "Who approves leave?", a: "An administrator. This portal can record a sample application and cannot approve it." },
];

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
}

export function HelpPage() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "T-204", subject: "Timetable shows an extra free period", category: "Timetable", status: "Open · sample" },
  ]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Access");
  const [detail, setDetail] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <PageContainer
      title="Help and support"
      description="Guides for this portal and a sample ticket list."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Help" }]}
    >
      <MockCaption>Tickets are not sent to the school office.</MockCaption>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2">
          <h2 className="text-base font-semibold">FAQs</h2>
          {FAQS.map((item, index) => (
            <button
              key={item.q}
              type="button"
              className="block w-full rounded-xl border border-border bg-card px-3 py-3 text-left"
              onClick={() => setOpenFaq(index)}
            >
              <span className="text-sm font-medium">{item.q}</span>
              {openFaq === index ? <span className="mt-1 block text-sm text-muted-foreground">{item.a}</span> : null}
            </button>
          ))}
          <p className="text-sm text-muted-foreground">School office: front desk, SPDF International School. This is not a live chat.</p>
        </section>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (subject.trim().length < 4 || detail.trim().length < 8) return;
            setTickets((current) => [{ id: `T-${Date.now().toString().slice(-3)}`, subject: subject.trim(), category, status: "Open · this browser" }, ...current]);
            setSubject("");
            setDetail("");
            toast.success("Ticket kept in this browser only.");
          }}
        >
          <h2 className="text-base font-semibold">Raise a ticket</h2>
          <Input label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Category</span>
            <select className="h-11 rounded-lg border border-input bg-card px-3" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Access</option>
              <option>Timetable</option>
              <option>Homework</option>
              <option>Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">What happened?</span>
            <textarea className="min-h-24 rounded-lg border border-input bg-card px-3 py-2" value={detail} onChange={(event) => setDetail(event.target.value)} />
          </label>
          <Button type="submit">Save ticket</Button>
        </form>
      </div>
      <ul className="space-y-2">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3">
            <div>
              <p className="text-sm font-medium">{ticket.subject}</p>
              <p className="text-xs text-muted-foreground">{ticket.id} · {ticket.category}</p>
            </div>
            <Badge>{ticket.status}</Badge>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
