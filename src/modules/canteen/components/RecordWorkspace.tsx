"use client";

import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MockCaption } from "@/components/ui/MockCaption";
import { paginate } from "@/lib/utils";
import { ConfirmDialog } from "@/modules/canteen/components/ConfirmDialog";
import { Drawer } from "@/modules/canteen/components/Drawer";
import { RowActions } from "@/modules/canteen/components/RowActions";

export function RecordWorkspace<T extends { id: string }>({
  title,
  description,
  crumb,
  items,
  columns,
  summary,
  filters,
  searchLabel,
  match,
  recordName,
  createLabel,
  blank,
  copy,
  validate,
  onSave,
  onDelete,
  form,
  view,
}: {
  title: string;
  description: string;
  crumb: string;
  items: T[];
  columns: { header: string; cell: (row: T) => ReactNode }[];
  summary?: ReactNode;
  filters?: ReactNode;
  searchLabel: string;
  match: (row: T, query: string) => boolean;
  recordName: (row: T) => string;
  createLabel: string;
  blank: () => T;
  copy: (row: T) => T;
  validate: (draft: T) => Record<string, string>;
  onSave: (row: T) => void;
  onDelete: (id: string) => boolean;
  form: (draft: T, update: (patch: Partial<T>) => void, errors: Record<string, string>) => ReactNode;
  view: (row: T) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<T | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filtered = useMemo(() => items.filter((item) => match(item, query.trim().toLowerCase())), [items, match, query]);
  const pageResult = paginate(filtered, page, 8);
  const viewing = items.find((item) => item.id === viewId) ?? null;
  const deleting = items.find((item) => item.id === deleteId) ?? null;

  function openCreate() {
    setErrors({});
    setDraft(blank());
  }

  function openEdit(row: T) {
    setErrors({});
    setViewId(null);
    setDraft(copy(row));
  }

  function save() {
    if (!draft) return;
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    const first = Object.values(nextErrors)[0];
    if (first) {
      toast.error(first);
      return;
    }
    onSave(draft);
    toast.success("Saved in this browser. The school has not received this change.");
    setDraft(null);
  }

  return (
    <PageContainer
      title={title}
      description={description}
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Canteen / Cafeteria", href: "/app/canteen" }, { label: crumb }]}
    >
      <MockCaption>These records stay in this browser. They are not saved to the school.</MockCaption>
      {summary}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">{filters}</div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          {createLabel}
        </Button>
      </div>
      <input
        aria-label={searchLabel}
        value={query}
        placeholder={searchLabel}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
        className="h-11 w-full max-w-xl rounded-lg border border-input bg-card px-3 text-sm"
      />
      {filtered.length === 0 ? (
        <EmptyState
          title="No records match"
          description="Try another search, or add a record in this browser."
          action={query ? <Button variant="outline" onClick={() => setQuery("")}>Clear search</Button> : <Button onClick={openCreate}>{createLabel}</Button>}
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  {columns.map((column) => (
                    <th key={column.header} scope="col" className="px-3 py-3 font-medium">
                      {column.header}
                    </th>
                  ))}
                  <th scope="col" className="w-36 px-3 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageResult.items.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    {columns.map((column) => (
                      <td key={column.header} className="px-3 py-3 align-middle">
                        {column.cell(row)}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-3">
                      <RowActions
                        name={recordName(row)}
                        onView={() => setViewId(row.id)}
                        onEdit={() => openEdit(row)}
                        onDelete={() => setDeleteId(row.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {pageResult.items.map((row) => (
              <li key={row.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                {columns.map((column) => (
                  <div key={column.header} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{column.header}</span>
                    <span className="min-w-0 text-right">{column.cell(row)}</span>
                  </div>
                ))}
                <RowActions
                  name={recordName(row)}
                  onView={() => setViewId(row.id)}
                  onEdit={() => openEdit(row)}
                  onDelete={() => setDeleteId(row.id)}
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>
              Page {pageResult.page} of {pageResult.totalPages} · {pageResult.total} {pageResult.total === 1 ? "row" : "rows"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={!pageResult.hasPreviousPage} onClick={() => setPage(pageResult.page - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={!pageResult.hasNextPage} onClick={() => setPage(pageResult.page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      {draft ? (
        <Drawer
          title={draft.id ? `Edit ${recordName(draft)}` : createLabel}
          description="Saved in this browser only."
          onClose={() => setDraft(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          {form(draft, (patch) => setDraft((current) => (current ? { ...current, ...patch } : current)), errors)}
        </Drawer>
      ) : null}
      {viewing ? (
        <Drawer title={recordName(viewing)} description="Details from the browser sample." onClose={() => setViewId(null)} footer={<Button variant="outline" onClick={() => openEdit(viewing)}>Edit</Button>}>
          {view(viewing)}
        </Drawer>
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title={`Delete ${recordName(deleting)}?`}
          description="This removes the record in this browser. It is not removed from a school system."
          confirmLabel="Delete"
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            const removed = onDelete(deleting.id);
            if (!removed) toast.error("That record is no longer in this browser.");
            else toast.success(`${recordName(deleting)} removed from this browser.`);
            setDeleteId(null);
            if (viewId === deleting.id) setViewId(null);
          }}
        />
      ) : null}
    </PageContainer>
  );
}

export function fieldClass(error?: string) {
  return `h-11 w-full rounded-lg border bg-card px-3 text-sm ${error ? "border-danger" : "border-input"}`;
}

export function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-xs text-danger">{message}</span> : null;
}
