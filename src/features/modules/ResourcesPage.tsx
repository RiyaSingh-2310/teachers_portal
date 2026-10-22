"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MockCaption } from "@/components/ui/MockCaption";
import { RESOURCES } from "@/mocks/catalog";

export function ResourcesPage() {
  const [items, setItems] = useState(RESOURCES);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"title" | "chapter">("title");
  const visible = useMemo(() => {
    return items
      .filter((item) => `${item.title} ${item.chapter}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a[sort].localeCompare(b[sort]));
  }, [items, query, sort]);

  return (
    <PageContainer
      title="Study materials"
      description="Files for your classes. PDF and images only."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Resources" }]}
    >
      <MockCaption>Choosing a file records its name here. It is not uploaded to the school.</MockCaption>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input label="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Sort</span>
          <select className="h-11 rounded-lg border border-input bg-card px-3" value={sort} onChange={(event) => setSort(event.target.value as "title" | "chapter")}>
            <option value="title">Title</option>
            <option value="chapter">Chapter</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Add a file name</span>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setItems((current) => [{ id: `r-${Date.now()}`, title: file.name, kind: "PDF", chapter: "Unsorted", shared: false }, ...current]);
              toast.success("File name kept in this browser. Not uploaded.");
            }}
          />
        </label>
      </div>
      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3">
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.chapter} · {item.kind}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={item.shared ? "success" : "default"}>{item.shared ? "Shared with class" : "Private"}</Badge>
              <Button
                variant="outline"
                onClick={() => {
                  setItems((current) => current.map((row) => (row.id === item.id ? { ...row, shared: !row.shared } : row)));
                  toast.success("Sharing updated in this browser only.");
                }}
              >
                {item.shared ? "Unshare" : "Share"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
