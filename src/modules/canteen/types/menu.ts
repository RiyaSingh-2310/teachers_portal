export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  mealType: string;
  servingTime: string;
  featured: boolean;
  stock: number;
  active: boolean;
  imageDataUrl: string | null;
  imageName: string | null;
}

export interface MenuFormValues {
  name: string;
  description: string;
  category: string;
  newCategory: string;
  price: string;
  available: boolean;
  mealType: string;
  servingTime: string;
  featured: boolean;
  stock: string;
  active: boolean;
  imageDataUrl: string | null;
  imageName: string | null;
}

export interface MenuFieldErrors {
  name?: string;
  category?: string;
  price?: string;
  image?: string;
  servingTime?: string;
  description?: string;
  stock?: string;
}

export type AvailabilityFilter = "all" | "available" | "unavailable";
export type SortKey = "name" | "category" | "price" | "status";
export type SortDirection = "asc" | "desc";
