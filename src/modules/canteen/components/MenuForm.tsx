"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveMenuItem } from "@/modules/canteen/data/menu";
import type { MenuFieldErrors, MenuFormValues, MenuItem } from "@/modules/canteen/types/menu";
import { MEAL_TYPES, emptyMenuForm, formFromItem, parsePrice, resolveCategory, validateMenuForm } from "@/modules/canteen/utils/menu";
import { Drawer } from "@/modules/canteen/components/Drawer";
import { ImageUploader } from "@/modules/canteen/components/ImageUploader";

export function MenuForm({
  item,
  categories,
  onClose,
}: {
  item: MenuItem | null;
  categories: string[];
  onClose: () => void;
}) {
  const [values, setValues] = useState<MenuFormValues>(() => (item ? formFromItem(item) : emptyMenuForm(categories[0] ?? "")));
  const [errors, setErrors] = useState<MenuFieldErrors>({});

  function update<K extends keyof MenuFormValues>(key: K, value: MenuFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      ...(key === "newCategory" || key === "category" ? { category: undefined } : {}),
    }));
  }

  function save() {
    const nextErrors = validateMenuForm(values, categories);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const category = resolveCategory(values, categories);
    saveMenuItem({
      id: item?.id,
      name: values.name.trim(),
      description: values.description.trim(),
      category,
      price: parsePrice(values.price),
      available: values.available,
      mealType: values.mealType,
      servingTime: values.servingTime.trim(),
      featured: values.featured,
      stock: Number(values.stock),
      active: values.active,
      imageDataUrl: values.imageDataUrl,
      imageName: values.imageName,
    });
    toast.success(item ? "Menu item updated in this browser." : "Menu item added in this browser.");
    onClose();
  }

  return (
    <Drawer
      title={item ? "Edit menu item" : "Add menu item"}
      description="Saved in this browser only. The school canteen record is not updated."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{item ? "Save changes" : "Save"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <ImageUploader
          imageDataUrl={values.imageDataUrl}
          imageName={values.imageName}
          error={errors.image}
          onChange={(image, error) => {
            setValues((current) => ({ ...current, ...image }));
            setErrors((current) => ({ ...current, image: error ?? undefined }));
          }}
        />
        <Input label="Item name" value={values.name} error={errors.name} onChange={(event) => update("name", event.target.value)} />
        <label className="flex w-full flex-col gap-1.5 text-sm">
          <span className="font-medium">Description</span>
          <textarea
            value={values.description}
            rows={3}
            onChange={(event) => update("description", event.target.value)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
          />
          {errors.description ? <span className="text-xs text-danger">{errors.description}</span> : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex w-full flex-col gap-1.5 text-sm">
            <span className="font-medium">Category</span>
            <select
              value={values.category}
              onChange={(event) => update("category", event.target.value)}
              className="h-11 rounded-lg border border-input bg-card px-3"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? <span className="text-xs text-danger">{errors.category}</span> : null}
          </label>
          <Input
            label="New category"
            hint="Optional. Fills in when the list does not have the right category."
            value={values.newCategory}
            onChange={(event) => update("newCategory", event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (₹)"
            inputMode="decimal"
            value={values.price}
            error={errors.price}
            placeholder="45.00"
            onChange={(event) => update("price", event.target.value)}
          />
          <Input
            label="Stock"
            inputMode="numeric"
            value={values.stock}
            error={errors.stock}
            onChange={(event) => update("stock", event.target.value)}
          />
          <label className="flex w-full flex-col gap-1.5 text-sm">
            <span className="font-medium">Availability</span>
            <select
              value={values.available ? "available" : "unavailable"}
              onChange={(event) => update("available", event.target.value === "available")}
              className="h-11 rounded-lg border border-input bg-card px-3"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex w-full flex-col gap-1.5 text-sm">
            <span className="font-medium">Meal type</span>
            <select
              value={values.mealType}
              onChange={(event) => update("mealType", event.target.value)}
              className="h-11 rounded-lg border border-input bg-card px-3"
            >
              <option value="">Not set</option>
              {MEAL_TYPES.map((meal) => (
                <option key={meal} value={meal}>
                  {meal}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Serving time"
            hint="Optional, for example 12:00–14:30."
            value={values.servingTime}
            error={errors.servingTime}
            onChange={(event) => update("servingTime", event.target.value)}
          />
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--brand)]"
            checked={values.featured}
            onChange={(event) => update("featured", event.target.checked)}
          />
          Featured item
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--brand)]"
            checked={values.active}
            onChange={(event) => update("active", event.target.checked)}
          />
          Active
        </label>
      </div>
    </Drawer>
  );
}
