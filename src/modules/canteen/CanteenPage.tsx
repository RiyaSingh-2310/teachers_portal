"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MockCaption } from "@/components/ui/MockCaption";
import { paginate } from "@/lib/utils";
import { toast } from "sonner";
import { deleteMenuItem, setMenuActive, useCanteenState } from "@/modules/canteen/data/menu";
import { ConfirmDialog } from "@/modules/canteen/components/ConfirmDialog";
import { ItemDetails } from "@/modules/canteen/components/ItemDetails";
import { MenuFilters } from "@/modules/canteen/components/MenuFilters";
import { MenuForm } from "@/modules/canteen/components/MenuForm";
import { MenuTable } from "@/modules/canteen/components/MenuTable";
import { StatCards } from "@/modules/canteen/components/StatCards";
import type { AvailabilityFilter, SortDirection, SortKey } from "@/modules/canteen/types/menu";
import { sortMenuItems } from "@/modules/canteen/utils/menu";

const PAGE_SIZES = [8, 10, 20];

export function FoodItemPage() {
  const { items, categories } = useCanteenState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [formId, setFormId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const matched = items.filter((item) => {
      if (text && !item.name.toLowerCase().includes(text)) return false;
      if (category !== "all" && item.category !== category) return false;
      if (availability === "available" && !item.available) return false;
      if (availability === "unavailable" && item.available) return false;
      return true;
    });
    return sortMenuItems(matched, sortKey, sortDir);
  }, [items, query, category, availability, sortKey, sortDir]);

  const pageResult = paginate(filtered, page, pageSize);
  const editing = formId ? items.find((item) => item.id === formId) ?? null : null;
  const viewing = items.find((item) => item.id === viewId) ?? null;
  const deleting = items.find((item) => item.id === deleteId) ?? null;
  const filtersActive = query.trim() !== "" || category !== "all" || availability !== "all";

  function resetPage() {
    setPage(1);
  }

  function onSort(key: SortKey) {
    setSortDir((current) => (sortKey === key && current === "asc" ? "desc" : "asc"));
    setSortKey(key);
    resetPage();
  }

  return (
    <PageContainer
      title="Food Item"
      description="Food sold at the canteen, with category, price, stock, availability, and active status."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Canteen / Cafeteria", href: "/app/canteen" }, { label: "Food Item" }]}
    >
      <MockCaption>Food item changes stay in this browser. They are not saved to the school.</MockCaption>
      <StatCards
        cards={[
          { label: "Food items", value: items.length },
          { label: "Active", value: items.filter((item) => item.active).length },
          { label: "Inactive", value: items.filter((item) => !item.active).length },
          { label: "Low stock", value: items.filter((item) => item.stock < 10).length },
        ]}
      />
      <MenuFilters
        query={query}
        category={category}
        availability={availability}
        categories={categories}
        onQuery={(value) => {
          setQuery(value);
          resetPage();
        }}
        onCategory={(value) => {
          setCategory(value);
          resetPage();
        }}
        onAvailability={(value) => {
          setAvailability(value);
          resetPage();
        }}
        onAdd={() => setFormId(null)}
      />
      {filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "No menu items yet" : "No menu items match"}
          description={
            items.length === 0
              ? "Add a menu item to start the canteen list in this browser."
              : "Try another name, category, or availability."
          }
          action={
            filtersActive ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setAvailability("all");
                  resetPage();
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => setFormId(null)}>Add menu item</Button>
            )
          }
        />
      ) : (
        <>
          <MenuTable
            items={pageResult.items}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
            onView={setViewId}
            onEdit={(id) => {
              setViewId(null);
              setFormId(id);
            }}
            onActive={(id, active) => {
              const item = items.find((row) => row.id === id);
              if (!item || !setMenuActive(id, active)) toast.error("That food item is no longer in this browser.");
              else toast.success(`${item.name} is now ${active ? "active" : "inactive"}.`);
            }}
            onDelete={setDeleteId}
          />
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Page {pageResult.page} of {pageResult.totalPages} · {pageResult.total} {pageResult.total === 1 ? "item" : "items"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2">
                <span>Rows</span>
                <select
                  aria-label="Rows per page"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    resetPage();
                  }}
                  className="h-11 rounded-lg border border-input bg-card px-3"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
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
      {formId !== undefined ? (
        <MenuForm
          key={formId ?? "new"}
          item={editing}
          categories={categories}
          onClose={() => setFormId(undefined)}
        />
      ) : null}
      {viewing ? (
        <ItemDetails
          item={viewing}
          onClose={() => setViewId(null)}
          onEdit={() => {
            setFormId(viewing.id);
            setViewId(null);
          }}
          onActive={(active) => {
            if (!setMenuActive(viewing.id, active)) toast.error("That food item is no longer in this browser.");
            else toast.success(`${viewing.name} is now ${active ? "active" : "inactive"}.`);
          }}
        />
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          description="This removes the item from the menu in this browser. It is not removed from a school system."
          confirmLabel="Delete item"
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            deleteMenuItem(deleting.id);
            toast.success(`${deleting.name} removed from this browser.`);
            if (viewId === deleting.id) setViewId(null);
            setDeleteId(null);
          }}
        />
      ) : null}
    </PageContainer>
  );
}
