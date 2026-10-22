"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

export function RowActions({
  name,
  onView,
  onEdit,
  onDelete,
}: {
  name: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const actions = [
    { label: "View", icon: Eye, onClick: onView, className: "hover:bg-muted" },
    { label: "Edit", icon: Pencil, onClick: onEdit, className: "hover:bg-muted" },
    { label: "Delete", icon: Trash2, onClick: onDelete, className: "text-danger hover:bg-danger-muted" },
  ];
  return (
    <div className="flex flex-nowrap items-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            title={action.label}
            aria-label={`${action.label} ${name}`}
            onClick={action.onClick}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.className}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
