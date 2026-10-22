"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AvailabilityFilter } from "@/modules/canteen/types/menu";

export function MenuFilters({
  query,
  category,
  availability,
  categories,
  onQuery,
  onCategory,
  onAvailability,
  onAdd,
}: {
  query: string;
  category: string;
  availability: AvailabilityFilter;
  categories: string[];
  onQuery: (value: string) => void;
  onCategory: (value: string) => void;
  onAvailability: (value: AvailabilityFilter) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl lg:flex-1">
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => onCategory(event.target.value)}
            className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by availability"
            value={availability}
            onChange={(event) => onAvailability(event.target.value as AvailabilityFilter)}
            className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="all">All availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add menu item
        </Button>
      </div>
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-label="Search menu items"
          value={query}
          placeholder="Search menu items…"
          onChange={(event) => onQuery(event.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm"
        />
      </div>
    </div>
  );
}
