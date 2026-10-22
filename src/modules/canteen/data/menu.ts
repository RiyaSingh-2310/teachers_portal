"use client";

import { useSyncExternalStore } from "react";
import type { MenuItem } from "@/modules/canteen/types/menu";

export const DEFAULT_CATEGORIES = ["Breakfast", "Lunch", "Snacks", "Beverages", "Desserts"];

function sampleImage(label: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="24" fill="${color}"/><text x="80" y="92" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="700" fill="white">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const seed: Array<Omit<MenuItem, "stock" | "active">> = [
  {
    id: "menu-1",
    name: "Masala Poha",
    description: "Flattened rice with onion, peanuts, and lemon.",
    category: "Breakfast",
    price: 35,
    available: true,
    mealType: "Breakfast",
    servingTime: "07:30–09:30",
    featured: true,
    imageDataUrl: sampleImage("PO", "#b45309"),
    imageName: "sample-poha.svg",
  },
  {
    id: "menu-2",
    name: "Idli Sambar",
    description: "Steamed rice cakes with sambar and coconut chutney.",
    category: "Breakfast",
    price: 40,
    available: true,
    mealType: "Breakfast",
    servingTime: "07:30–09:30",
    featured: false,
    imageDataUrl: sampleImage("ID", "#9a3412"),
    imageName: "sample-idli.svg",
  },
  {
    id: "menu-3",
    name: "Veg Thali",
    description: "Rice, two vegetables, dal, roti, and salad.",
    category: "Lunch",
    price: 90,
    available: true,
    mealType: "Lunch",
    servingTime: "12:00–14:30",
    featured: true,
    imageDataUrl: sampleImage("TH", "#047857"),
    imageName: "sample-thali.svg",
  },
  {
    id: "menu-4",
    name: "Rajma Chawal",
    description: "Kidney-bean curry with steamed rice.",
    category: "Lunch",
    price: 80,
    available: true,
    mealType: "Lunch",
    servingTime: "12:00–14:30",
    featured: false,
    imageDataUrl: sampleImage("RC", "#b91c1c"),
    imageName: "sample-rajma.svg",
  },
  {
    id: "menu-5",
    name: "Paneer Wrap",
    description: "Grilled paneer, salad, and mint chutney in a roti.",
    category: "Snacks",
    price: 70,
    available: false,
    mealType: "Snacks",
    servingTime: "10:00–11:30",
    featured: false,
    imageDataUrl: sampleImage("PW", "#7c3aed"),
    imageName: "sample-wrap.svg",
  },
  {
    id: "menu-6",
    name: "Fruit Bowl",
    description: "Seasonal cut fruit.",
    category: "Snacks",
    price: 45,
    available: true,
    mealType: "Snacks",
    servingTime: "10:00–16:00",
    featured: false,
    imageDataUrl: sampleImage("FB", "#0f766e"),
    imageName: "sample-fruit.svg",
  },
  {
    id: "menu-7",
    name: "Masala Milk",
    description: "Warm milk with cardamom and a little jaggery.",
    category: "Beverages",
    price: 25,
    available: true,
    mealType: "Breakfast",
    servingTime: "07:30–10:00",
    featured: false,
    imageDataUrl: sampleImage("MM", "#a16207"),
    imageName: "sample-milk.svg",
  },
  {
    id: "menu-8",
    name: "Cold Coffee",
    description: "Chilled coffee with milk. No extra sugar.",
    category: "Beverages",
    price: 50,
    available: true,
    mealType: "",
    servingTime: "10:00–16:00",
    featured: false,
    imageDataUrl: sampleImage("CC", "#44403c"),
    imageName: "sample-coffee.svg",
  },
  {
    id: "menu-9",
    name: "Gulab Jamun",
    description: "Two pieces in warm syrup.",
    category: "Desserts",
    price: 30,
    available: true,
    mealType: "Lunch",
    servingTime: "12:00–15:00",
    featured: true,
    imageDataUrl: sampleImage("GJ", "#be123c"),
    imageName: "sample-jamun.svg",
  },
  {
    id: "menu-10",
    name: "Chocolate Brownie",
    description: "Baked brownie square.",
    category: "Desserts",
    price: 55,
    available: false,
    mealType: "Snacks",
    servingTime: "11:00–16:00",
    featured: false,
    imageDataUrl: sampleImage("BR", "#78350f"),
    imageName: "sample-brownie.svg",
  },
  {
    id: "menu-11",
    name: "Lemonade",
    description: "Fresh lime water, lightly sweetened.",
    category: "Beverages",
    price: 20,
    available: true,
    mealType: "",
    servingTime: "10:00–16:00",
    featured: false,
    imageDataUrl: sampleImage("LE", "#65a30d"),
    imageName: "sample-lemonade.svg",
  },
];

interface CanteenState {
  items: MenuItem[];
  categories: string[];
}

let seq = seed.length;
const STOCK = [40, 36, 28, 22, 0, 30, 48, 16, 12, 0, 50];

let state: CanteenState = {
  items: seed.map((item, index) => ({
    ...item,
    stock: STOCK[index] ?? 10,
    active: item.id !== "menu-5",
  })),
  categories: [...DEFAULT_CATEGORIES],
};
const listeners = new Set<() => void>();

function emit(next: CanteenState) {
  state = {
    items: next.items.map((item) => ({ ...item })),
    categories: [...next.categories],
  };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getState() {
  return state;
}

export function useCanteenState() {
  return useSyncExternalStore(subscribe, getState, getState);
}

function withCategory(categories: string[], name: string) {
  if (categories.some((category) => category.toLowerCase() === name.toLowerCase())) return categories;
  return [...categories, name];
}

export function saveMenuItem(input: Omit<MenuItem, "id"> & { id?: string }) {
  const categories = withCategory(state.categories, input.category);
  if (input.id) {
    emit({
      categories,
      items: state.items.map((item) => (item.id === input.id ? { ...input, id: input.id } : item)),
    });
    return input.id;
  }
  seq += 1;
  const id = `menu-${seq}`;
  emit({ categories, items: [{ ...input, id }, ...state.items] });
  return id;
}

export function setMenuAvailability(id: string, available: boolean) {
  emit({
    ...state,
    items: state.items.map((item) => (item.id === id ? { ...item, available } : item)),
  });
}

export function setMenuActive(id: string, active: boolean) {
  const current = state.items.find((item) => item.id === id);
  if (!current) return false;
  emit({
    ...state,
    items: state.items.map((item) => (item.id === id ? { ...item, active } : item)),
  });
  return true;
}

export function deleteMenuItem(id: string) {
  emit({ ...state, items: state.items.filter((item) => item.id !== id) });
}
