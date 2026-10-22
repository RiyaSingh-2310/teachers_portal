"use client";

import { useSyncExternalStore } from "react";

interface RecordItem {
  id: string;
}

function createStore<T extends RecordItem>(prefix: string, seed: T[]) {
  let seq = seed.length;
  let snapshot = seed.map((item) => ({ ...item }));
  const listeners = new Set<() => void>();

  function emit(next: T[]) {
    snapshot = next.map((item) => ({ ...item }));
    listeners.forEach((listener) => listener());
  }

  return {
    useItems() {
      return useSyncExternalStore(
        (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        () => snapshot,
        () => snapshot,
      );
    },
    save(input: T) {
      if (input.id && snapshot.some((item) => item.id === input.id)) {
        emit(snapshot.map((item) => (item.id === input.id ? { ...input } : item)));
        return input.id;
      }
      seq += 1;
      const id = `${prefix}-${seq}`;
      emit([{ ...input, id }, ...snapshot]);
      return id;
    },
    remove(id: string) {
      if (!snapshot.some((item) => item.id === id)) return false;
      emit(snapshot.filter((item) => item.id !== id));
      return true;
    },
    patch(id: string, update: Partial<T>) {
      const current = snapshot.find((item) => item.id === id);
      if (!current) return false;
      emit(snapshot.map((item) => (item.id === id ? { ...item, ...update } : item)));
      return true;
    },
  };
}

export interface MenuEntry {
  id: string;
  day: string;
  slot: string;
  items: string;
  active: boolean;
}

export interface PriceRow {
  id: string;
  itemName: string;
  category: string;
  price: number;
  effectiveFrom: string;
  active: boolean;
}

export interface CanteenMail {
  id: string;
  subject: string;
  audience: string;
  sentOn: string;
  body: string;
  status: "Sent" | "Draft";
}

export interface CanteenOrder {
  id: string;
  orderNo: string;
  date: string;
  items: string;
  quantity: number;
  amount: number;
  payment: "Paid" | "Unpaid";
  status: "Pending" | "Preparing" | "Served" | "Cancelled";
}

export interface WalletTxn {
  id: string;
  date: string;
  description: string;
  kind: "Credit" | "Debit";
  amount: number;
}

export interface StockUse {
  id: string;
  item: string;
  quantity: number;
  date: string;
  remaining: number;
}

export interface PurchaseRow {
  id: string;
  supplier: string;
  item: string;
  quantity: number;
  cost: number;
  date: string;
}

export interface SafetyCheck {
  id: string;
  check: string;
  area: string;
  inspector: string;
  date: string;
  expiry: string;
  status: "Compliant" | "Due" | "Overdue";
}

const menuEntries = createStore<MenuEntry>("entry", [
  { id: "entry-1", day: "Monday", slot: "Breakfast", items: "Masala Poha, Idli Sambar", active: true },
  { id: "entry-2", day: "Monday", slot: "Lunch", items: "Veg Thali, Rajma Chawal", active: true },
  { id: "entry-3", day: "Tuesday", slot: "Short Break", items: "Fruit Bowl, Masala Milk", active: true },
  { id: "entry-4", day: "Wednesday", slot: "Lunch", items: "Veg Thali, Gulab Jamun", active: true },
  { id: "entry-5", day: "Thursday", slot: "Snacks", items: "Paneer Wrap, Cold Coffee", active: false },
  { id: "entry-6", day: "Friday", slot: "Breakfast", items: "Idli Sambar, Masala Milk", active: true },
]);

const prices = createStore<PriceRow>("price", [
  { id: "price-1", itemName: "Veg Thali", category: "Student", price: 90, effectiveFrom: "2026-04-01", active: true },
  { id: "price-2", itemName: "Veg Thali", category: "Staff", price: 110, effectiveFrom: "2026-04-01", active: true },
  { id: "price-3", itemName: "Cold Coffee", category: "Student", price: 50, effectiveFrom: "2026-08-01", active: true },
  { id: "price-4", itemName: "Paneer Wrap", category: "Student", price: 70, effectiveFrom: "2026-06-15", active: false },
]);

const mail = createStore<CanteenMail>("mail", [
  { id: "mail-1", subject: "Monday lunch portion change", audience: "Canteen staff", sentOn: "2026-10-20", body: "Serve the smaller rice portion for Class 6 until Friday.", status: "Sent" },
  { id: "mail-2", subject: "Fruit bowl unavailable", audience: "Teachers", sentOn: "2026-10-21", body: "Fruit bowl is off the counter today. Milk and lemonade remain available.", status: "Sent" },
  { id: "mail-3", subject: "Friday special draft", audience: "Canteen staff", sentOn: "2026-10-22", body: "Draft note for the Friday breakfast counter.", status: "Draft" },
]);

const orders = createStore<CanteenOrder>("order", [
  { id: "order-1", orderNo: "CO-2401", date: "2026-10-20", items: "Veg Thali, Gulab Jamun", quantity: 2, amount: 120, payment: "Paid", status: "Served" },
  { id: "order-2", orderNo: "CO-2402", date: "2026-10-21", items: "Masala Poha", quantity: 1, amount: 35, payment: "Paid", status: "Served" },
  { id: "order-3", orderNo: "CO-2403", date: "2026-10-22", items: "Rajma Chawal, Masala Milk", quantity: 2, amount: 105, payment: "Unpaid", status: "Pending" },
  { id: "order-4", orderNo: "CO-2404", date: "2026-10-22", items: "Cold Coffee", quantity: 3, amount: 150, payment: "Paid", status: "Preparing" },
  { id: "order-5", orderNo: "CO-2405", date: "2026-10-18", items: "Idli Sambar", quantity: 1, amount: 40, payment: "Paid", status: "Cancelled" },
]);

const wallet = createStore<WalletTxn>("wallet", [
  { id: "wallet-1", date: "2026-10-01", description: "October staff credit", kind: "Credit", amount: 1500 },
  { id: "wallet-2", date: "2026-10-20", description: "Veg Thali and Gulab Jamun", kind: "Debit", amount: 120 },
  { id: "wallet-3", date: "2026-10-21", description: "Masala Poha", kind: "Debit", amount: 35 },
  { id: "wallet-4", date: "2026-10-22", description: "Top-up at the counter", kind: "Credit", amount: 200 },
]);

const stockUses = createStore<StockUse>("stock", [
  { id: "stock-1", item: "Rice", quantity: 8, date: "2026-10-20", remaining: 42 },
  { id: "stock-2", item: "Milk", quantity: 6, date: "2026-10-21", remaining: 18 },
  { id: "stock-3", item: "Paneer", quantity: 3, date: "2026-10-22", remaining: 4 },
  { id: "stock-4", item: "Fruit", quantity: 5, date: "2026-10-22", remaining: 7 },
]);

const purchases = createStore<PurchaseRow>("purchase", [
  { id: "purchase-1", supplier: "Green Basket Vegetables", item: "Seasonal vegetables", quantity: 25, cost: 1800, date: "2026-10-18" },
  { id: "purchase-2", supplier: "Chitale Dairy", item: "Milk, 20 litres", quantity: 20, cost: 1400, date: "2026-10-20" },
  { id: "purchase-3", supplier: "Annapurna Caterers", item: "Rice, 50 kg", quantity: 50, cost: 2600, date: "2026-10-15" },
]);

const safety = createStore<SafetyCheck>("safety", [
  { id: "safety-1", check: "Kitchen hygiene", area: "Main kitchen", inspector: "Nurse Rao", date: "2026-10-16", expiry: "2026-11-16", status: "Compliant" },
  { id: "safety-2", check: "Food sample", area: "Lunch counter", inspector: "Nurse Rao", date: "2026-10-21", expiry: "2026-10-28", status: "Due" },
  { id: "safety-3", check: "Cold storage", area: "Dairy fridge", inspector: "Admin desk", date: "2026-09-20", expiry: "2026-10-20", status: "Overdue" },
]);

export const useMenuEntries = () => menuEntries.useItems();
export const saveMenuEntry = (row: MenuEntry) => menuEntries.save(row);
export const removeMenuEntry = (id: string) => menuEntries.remove(id);
export const patchMenuEntry = (id: string, update: Partial<MenuEntry>) => menuEntries.patch(id, update);

export const usePriceRows = () => prices.useItems();
export const savePriceRow = (row: PriceRow) => prices.save(row);
export const removePriceRow = (id: string) => prices.remove(id);
export const patchPriceRow = (id: string, update: Partial<PriceRow>) => prices.patch(id, update);

export const useCanteenMail = () => mail.useItems();
export const saveCanteenMail = (row: CanteenMail) => mail.save(row);
export const removeCanteenMail = (id: string) => mail.remove(id);

export const useCanteenOrders = () => orders.useItems();
export const saveCanteenOrder = (row: CanteenOrder) => orders.save(row);
export const removeCanteenOrder = (id: string) => orders.remove(id);

export const useWalletTxns = () => wallet.useItems();
export const saveWalletTxn = (row: WalletTxn) => wallet.save(row);
export const removeWalletTxn = (id: string) => wallet.remove(id);

export const useStockUses = () => stockUses.useItems();
export const saveStockUse = (row: StockUse) => stockUses.save(row);
export const removeStockUse = (id: string) => stockUses.remove(id);

export const usePurchases = () => purchases.useItems();
export const savePurchase = (row: PurchaseRow) => purchases.save(row);
export const removePurchase = (id: string) => purchases.remove(id);

export const useSafetyChecks = () => safety.useItems();
export const saveSafetyCheck = (row: SafetyCheck) => safety.save(row);
export const removeSafetyCheck = (id: string) => safety.remove(id);

export function formatDisplayDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export function inDateRange(iso: string, from: string, to: string) {
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}
