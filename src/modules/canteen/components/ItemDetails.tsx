"use client";

import { Button } from "@/components/ui/Button";
import type { MenuItem } from "@/modules/canteen/types/menu";
import { formatPrice } from "@/modules/canteen/utils/menu";
import { AvailabilityBadge } from "@/modules/canteen/components/AvailabilityBadge";
import { Drawer } from "@/modules/canteen/components/Drawer";
import { StatusSwitch } from "@/modules/canteen/components/StatusSwitch";
import { MenuThumb } from "@/modules/canteen/components/ImageUploader";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border py-3 sm:grid-cols-[9rem_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function ItemDetails({
  item,
  onClose,
  onEdit,
  onActive,
}: {
  item: MenuItem;
  onClose: () => void;
  onEdit: () => void;
  onActive: (active: boolean) => void;
}) {
  return (
    <Drawer
      title={item.name}
      description="Food item details from the browser sample. Nothing here is loaded from the school."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>Edit</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <MenuThumb src={item.imageDataUrl} name={item.name} />
          <AvailabilityBadge available={item.available && item.stock > 0} />
          <StatusSwitch active={item.active} label={item.name} onChange={onActive} />
        </div>
        <dl>
          <Row label="Category" value={item.category} />
          <Row label="Price" value={formatPrice(item.price)} />
          <Row label="Stock" value={String(item.stock)} />
          <Row label="Description" value={item.description || "No description"} />
          <Row label="Meal type" value={item.mealType || "Not set"} />
          <Row label="Serving time" value={item.servingTime || "Not set"} />
          <Row label="Status" value={item.active ? "Active" : "Inactive"} />
          <Row label="Image" value={item.imageName || "No image"} />
        </dl>
      </div>
    </Drawer>
  );
}
