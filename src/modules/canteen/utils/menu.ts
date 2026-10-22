import type { MenuFieldErrors, MenuFormValues, MenuItem, SortDirection, SortKey } from "@/modules/canteen/types/menu";

export const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"] as const;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function emptyMenuForm(category = ""): MenuFormValues {
  return {
    name: "",
    description: "",
    category,
    newCategory: "",
    price: "",
    available: true,
    mealType: "",
    servingTime: "",
    featured: false,
    stock: "",
    active: true,
    imageDataUrl: null,
    imageName: null,
  };
}

export function formFromItem(item: MenuItem): MenuFormValues {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    newCategory: "",
    price: Number.isInteger(item.price) ? String(item.price) : item.price.toFixed(2),
    available: item.available,
    mealType: item.mealType,
    servingTime: item.servingTime,
    featured: item.featured,
    stock: String(item.stock),
    active: item.active,
    imageDataUrl: item.imageDataUrl,
    imageName: item.imageName,
  };
}

export function resolveCategory(values: MenuFormValues, categories: string[]) {
  const typed = values.newCategory.trim();
  const chosen = typed || values.category.trim();
  const existing = categories.find((category) => category.toLowerCase() === chosen.toLowerCase());
  return existing ?? chosen;
}

export function validateMenuForm(values: MenuFormValues, categories: string[]): MenuFieldErrors {
  const errors: MenuFieldErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Enter an item name.";
  else if (name.length > 80) errors.name = "Keep the item name to 80 characters.";

  const category = resolveCategory(values, categories);
  if (!category) errors.category = "Choose a category or add one.";
  else if (category.length > 40) errors.category = "Keep the category to 40 characters.";

  const price = values.price.trim().replace(/[₹,\s]/g, "");
  if (!price) errors.price = "Enter a price.";
  else if (!/^(?:\d+)(?:\.\d{1,2})?$/.test(price)) {
    errors.price = "Enter a valid price, such as 45 or 45.50.";
  } else if (Number(price) > 99999.99) {
    errors.price = "Enter a price up to ₹99,999.99.";
  }

  if (values.description.trim().length > 280) {
    errors.description = "Keep the description to 280 characters.";
  }
  if (values.servingTime.trim().length > 40) {
    errors.servingTime = "Keep the serving time to 40 characters.";
  }
  if (!/^\d+$/.test(values.stock.trim())) errors.stock = "Enter a stock quantity of 0 or more.";
  return errors;
}

export function parsePrice(value: string) {
  return Number(value.trim().replace(/[₹,\s]/g, ""));
}

export function imageFileError(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Use a JPEG, PNG, WEBP, or GIF image.";
  }
  if (file.size > MAX_IMAGE_BYTES) return "Choose an image up to 2 MB.";
  if (file.size <= 0) return "That file is empty. Choose another image.";
  return null;
}

export function sortMenuItems(items: MenuItem[], key: SortKey, direction: SortDirection) {
  const factor = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (key === "price") return (a.price - b.price) * factor;
    if (key === "status") return (Number(a.active) - Number(b.active)) * factor;
    const left = key === "category" ? a.category : a.name;
    const right = key === "category" ? b.category : b.name;
    return left.localeCompare(right, "en") * factor;
  });
}

export function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("unreadable"));
    };
    reader.onerror = () => reject(new Error("unreadable"));
    reader.readAsDataURL(file);
  });
}
