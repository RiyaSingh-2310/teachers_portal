"use client";

import { Star } from "lucide-react";
import type { MenuItem, SortDirection, SortKey } from "@/modules/canteen/types/menu";
import { formatPrice } from "@/modules/canteen/utils/menu";
import { AvailabilityBadge } from "@/modules/canteen/components/AvailabilityBadge";
import { MenuThumb } from "@/modules/canteen/components/ImageUploader";
import { RowActions } from "@/modules/canteen/components/RowActions";
import { StatusSwitch } from "@/modules/canteen/components/StatusSwitch";

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === column;
  return (
    <th scope="col" aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"} className={className}>
      <button type="button" className="inline-flex min-h-11 items-center font-medium" onClick={() => onSort(column)}>
        {label}
        {active ? <span className="ml-1 text-xs">{sortDir === "asc" ? "↑" : "↓"}</span> : null}
      </button>
    </th>
  );
}

function ItemName({ item }: { item: MenuItem }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={item.active ? "font-medium" : "font-medium text-muted-foreground"}>{item.name}</span>
        {item.featured ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            Featured
          </span>
        ) : null}
      </div>
      {item.description ? <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p> : null}
    </div>
  );
}

export function MenuTable({
  items,
  sortKey,
  sortDir,
  onSort,
  onView,
  onEdit,
  onActive,
  onDelete,
}: {
  items: MenuItem[];
  sortKey: SortKey;
  sortDir: SortDirection;
  onSort: (key: SortKey) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  function status(item: MenuItem) {
    return (
      <StatusSwitch
        active={item.active}
        label={item.name}
        onChange={(active) => onActive(item.id, active)}
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th scope="col" className="w-16 px-3 font-medium">
                <span className="sr-only">Image</span>
              </th>
              <SortHeader label="Item" column="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="px-2" />
              <SortHeader label="Category" column="category" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="px-2" />
              <SortHeader label="Price" column="price" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="px-2" />
              <th scope="col" className="px-2 font-medium">
                <span className="inline-flex min-h-11 items-center">Stock</span>
              </th>
              <th scope="col" className="hidden px-2 font-medium lg:table-cell">
                <span className="inline-flex min-h-11 items-center">Availability</span>
              </th>
              <SortHeader label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="px-2" />
              <th scope="col" className="w-36 px-2 font-medium">
                <span className="inline-flex min-h-11 items-center">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3">
                  <MenuThumb src={item.imageDataUrl} name={item.name} />
                </td>
                <td className="px-2 py-3">
                  <ItemName item={item} />
                </td>
                <td className="px-2 py-3">{item.category}</td>
                <td className="px-2 py-3 tabular-nums">{formatPrice(item.price)}</td>
                <td className="px-2 py-3 tabular-nums">{item.stock}</td>
                <td className="hidden px-2 py-3 lg:table-cell">
                  <AvailabilityBadge available={item.available && item.stock > 0} />
                </td>
                <td className="px-2 py-3">{status(item)}</td>
                <td className="whitespace-nowrap px-2 py-3">
                  <RowActions name={item.name} onView={() => onView(item.id)} onEdit={() => onEdit(item.id)} onDelete={() => onDelete(item.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex gap-3">
              <MenuThumb src={item.imageDataUrl} name={item.name} />
              <div className="min-w-0 flex-1">
                <ItemName item={item} />
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.category} · {formatPrice(item.price)} · Stock {item.stock}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <AvailabilityBadge available={item.available && item.stock > 0} />
              {status(item)}
            </div>
            <div className="mt-2">
              <RowActions name={item.name} onView={() => onView(item.id)} onEdit={() => onEdit(item.id)} onDelete={() => onDelete(item.id)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
