"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockCaption } from "@/components/ui/MockCaption";
import { StatCards } from "@/modules/canteen/components/StatCards";
import { FieldError, fieldClass, RecordWorkspace } from "@/modules/canteen/components/RecordWorkspace";
import { StatusSwitch } from "@/modules/canteen/components/StatusSwitch";
import { useCanteenState } from "@/modules/canteen/data/menu";
import {
  formatDisplayDate,
  inDateRange,
  patchMenuEntry,
  patchPriceRow,
  removeCanteenMail,
  removeCanteenOrder,
  removeMenuEntry,
  removePriceRow,
  removePurchase,
  removeSafetyCheck,
  removeStockUse,
  removeWalletTxn,
  saveCanteenMail,
  saveCanteenOrder,
  saveMenuEntry,
  savePriceRow,
  savePurchase,
  saveSafetyCheck,
  saveStockUse,
  saveWalletTxn,
  useCanteenMail,
  useCanteenOrders,
  useMenuEntries,
  usePriceRows,
  usePurchases,
  useSafetyChecks,
  useStockUses,
  useWalletTxns,
  type CanteenMail,
  type CanteenOrder,
  type MenuEntry,
  type PriceRow,
  type PurchaseRow,
  type SafetyCheck,
  type StockUse,
  type WalletTxn,
} from "@/modules/canteen/data/records";
import { formatPrice } from "@/modules/canteen/utils/menu";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = ["Breakfast", "Short Break", "Lunch", "Snacks"];

function SelectField({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <select className={fieldClass(error)} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input className={fieldClass(error)} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      <FieldError message={error} />
    </label>
  );
}

function textRequired(value: string, label: string) {
  return value.trim() ? undefined : `Enter ${label}.`;
}

function numberRequired(value: number, label: string) {
  return Number.isFinite(value) && value >= 0 ? undefined : `Enter a valid ${label}.`;
}

function switchColumn<T extends { id: string; active: boolean }>(
  label: (row: T) => string,
  patch: (id: string, update: Partial<T>) => boolean,
) {
  return {
    header: "Status",
    cell: (row: T) => (
      <StatusSwitch
        active={row.active}
        label={label(row)}
        onChange={(active) => {
          if (!patch(row.id, { active } as Partial<T>)) toast.error("That record is no longer in this browser.");
          else toast.success(`${label(row)} is now ${active ? "active" : "inactive"}.`);
        }}
      />
    ),
  };
}

export function MenuSchedulePage() {
  const items = useMenuEntries();
  return (
    <RecordWorkspace<MenuEntry>
      title="Menu"
      description="Daily and scheduled menus. Inactive entries stay on the schedule and are not served."
      crumb="Menu"
      items={items}
      searchLabel="Search menus"
      match={(row, query) => !query || `${row.day} ${row.slot} ${row.items}`.toLowerCase().includes(query)}
      recordName={(row) => `${row.day} ${row.slot}`}
      createLabel="Add menu"
      summary={<StatCards cards={[{ label: "Menu entries", value: items.length }, { label: "Active", value: items.filter((row) => row.active).length }, { label: "Inactive", value: items.filter((row) => !row.active).length }]} />}
      columns={[
        { header: "Day", cell: (row) => row.day },
        { header: "Meal", cell: (row) => row.slot },
        { header: "Items", cell: (row) => <span className={row.active ? "" : "text-muted-foreground"}>{row.items}</span> },
        switchColumn<MenuEntry>((row) => `${row.day} ${row.slot}`, patchMenuEntry),
      ]}
      blank={() => ({ id: "", day: "Monday", slot: "Breakfast", items: "", active: true })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const itemsError = textRequired(draft.items, "the menu items");
        if (itemsError) errors.items = itemsError;
        return errors;
      }}
      onSave={saveMenuEntry}
      onDelete={removeMenuEntry}
      form={(draft, update, errors) => (
        <div className="grid gap-4">
          <SelectField label="Day" value={draft.day} options={DAYS} onChange={(day) => update({ day })} />
          <SelectField label="Meal" value={draft.slot} options={SLOTS} onChange={(slot) => update({ slot })} />
          <TextField label="Menu items" value={draft.items} error={errors.items} onChange={(value) => update({ items: value })} />
        </div>
      )}
      view={(row) => <p className="text-sm">{row.day} · {row.slot} · {row.items} · {row.active ? "Active" : "Inactive"}</p>}
    />
  );
}

export function PricingPage() {
  const rows = usePriceRows();
  return (
    <RecordWorkspace<PriceRow>
      title="Pricing"
      description="Prices by item and who they apply to. Inactive prices are kept for reference and are not the current charge."
      crumb="Pricing"
      items={rows}
      searchLabel="Search prices"
      match={(row, query) => !query || `${row.itemName} ${row.category}`.toLowerCase().includes(query)}
      recordName={(row) => `${row.itemName} · ${row.category}`}
      createLabel="Add price"
      columns={[
        { header: "Item", cell: (row) => row.itemName },
        { header: "Category", cell: (row) => row.category },
        { header: "Price", cell: (row) => formatPrice(row.price) },
        { header: "Effective", cell: (row) => formatDisplayDate(row.effectiveFrom) },
        switchColumn<PriceRow>((row) => row.itemName, patchPriceRow),
      ]}
      blank={() => ({ id: "", itemName: "", category: "Student", price: Number.NaN, effectiveFrom: "2026-10-22", active: true })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const name = textRequired(draft.itemName, "the item name");
        const price = numberRequired(draft.price, "price");
        if (name) errors.itemName = name;
        if (price) errors.price = price;
        if (!draft.effectiveFrom) errors.effectiveFrom = "Choose an effective date.";
        return errors;
      }}
      onSave={savePriceRow}
      onDelete={removePriceRow}
      form={(draft, update, errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Item name" value={draft.itemName} error={errors.itemName} onChange={(itemName) => update({ itemName })} />
          <SelectField label="Pricing category" value={draft.category} options={["Student", "Staff", "Guest"]} onChange={(category) => update({ category })} />
          <TextField label="Price (₹)" type="number" value={Number.isFinite(draft.price) ? String(draft.price) : ""} error={errors.price} onChange={(value) => update({ price: value === "" ? Number.NaN : Number(value) })} />
          <TextField label="Effective from" type="date" value={draft.effectiveFrom} error={errors.effectiveFrom} onChange={(effectiveFrom) => update({ effectiveFrom })} />
        </div>
      )}
      view={(row) => <p className="text-sm">{row.itemName} · {row.category} · {formatPrice(row.price)} from {formatDisplayDate(row.effectiveFrom)} · {row.active ? "Active" : "Inactive"}</p>}
    />
  );
}

export function MailPage() {
  const rows = useCanteenMail();
  return (
    <RecordWorkspace<CanteenMail>
      title="Mail"
      description="Canteen notes for staff and teachers. This list is separate from the school Messages inbox."
      crumb="Mail"
      items={rows}
      searchLabel="Search mail"
      match={(row, query) => !query || `${row.subject} ${row.audience} ${row.body}`.toLowerCase().includes(query)}
      recordName={(row) => row.subject}
      createLabel="Add mail"
      columns={[
        { header: "Subject", cell: (row) => row.subject },
        { header: "Audience", cell: (row) => row.audience },
        { header: "Date", cell: (row) => formatDisplayDate(row.sentOn) },
        { header: "Status", cell: (row) => <Badge variant={row.status === "Sent" ? "success" : "warning"}>{row.status}</Badge> },
      ]}
      blank={() => ({ id: "", subject: "", audience: "Canteen staff", sentOn: "2026-10-22", body: "", status: "Draft" })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const subject = textRequired(draft.subject, "a subject");
        const body = textRequired(draft.body, "a message");
        if (subject) errors.subject = subject;
        if (body) errors.body = body;
        return errors;
      }}
      onSave={saveCanteenMail}
      onDelete={removeCanteenMail}
      form={(draft, update, errors) => (
        <div className="grid gap-4">
          <TextField label="Subject" value={draft.subject} error={errors.subject} onChange={(subject) => update({ subject })} />
          <SelectField label="Audience" value={draft.audience} options={["Canteen staff", "Teachers", "Students"]} onChange={(audience) => update({ audience })} />
          <TextField label="Date" type="date" value={draft.sentOn} onChange={(sentOn) => update({ sentOn })} />
          <SelectField label="Status" value={draft.status} options={["Draft", "Sent"]} onChange={(status) => update({ status: status as CanteenMail["status"] })} />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Message</span>
            <textarea className="min-h-28 rounded-lg border border-input bg-card px-3 py-2 text-sm" value={draft.body} onChange={(event) => update({ body: event.target.value })} />
            <FieldError message={errors.body} />
          </label>
        </div>
      )}
      view={(row) => (
        <div className="space-y-2 text-sm">
          <p>{row.audience} · {formatDisplayDate(row.sentOn)} · {row.status}</p>
          <p>{row.body}</p>
        </div>
      )}
    />
  );
}

export function OrdersPage() {
  const rows = useCanteenOrders();
  return (
    <RecordWorkspace<CanteenOrder>
      title="Orders / Sales"
      description="Counter orders with quantity, amount, payment, and order status."
      crumb="Orders / Sales"
      items={rows}
      searchLabel="Search orders"
      match={(row, query) => !query || `${row.orderNo} ${row.items} ${row.status} ${row.payment}`.toLowerCase().includes(query)}
      recordName={(row) => row.orderNo}
      createLabel="Add order"
      columns={[
        { header: "Order", cell: (row) => row.orderNo },
        { header: "Date", cell: (row) => formatDisplayDate(row.date) },
        { header: "Items", cell: (row) => row.items },
        { header: "Qty", cell: (row) => row.quantity },
        { header: "Amount", cell: (row) => formatPrice(row.amount) },
        { header: "Payment", cell: (row) => <Badge variant={row.payment === "Paid" ? "success" : "warning"}>{row.payment}</Badge> },
        { header: "Status", cell: (row) => <Badge variant={row.status === "Cancelled" ? "danger" : row.status === "Served" ? "success" : "info"}>{row.status}</Badge> },
      ]}
      blank={() => ({ id: "", orderNo: "", date: "2026-10-22", items: "", quantity: Number.NaN, amount: Number.NaN, payment: "Unpaid", status: "Pending" })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const orderNo = textRequired(draft.orderNo, "an order number");
        const itemsError = textRequired(draft.items, "the items");
        const quantity = numberRequired(draft.quantity, "quantity");
        const amount = numberRequired(draft.amount, "amount");
        if (orderNo) errors.orderNo = orderNo;
        if (itemsError) errors.items = itemsError;
        if (quantity) errors.quantity = quantity;
        if (amount) errors.amount = amount;
        return errors;
      }}
      onSave={saveCanteenOrder}
      onDelete={removeCanteenOrder}
      form={(draft, update, errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Order number" value={draft.orderNo} error={errors.orderNo} onChange={(orderNo) => update({ orderNo })} />
          <TextField label="Date" type="date" value={draft.date} onChange={(date) => update({ date })} />
          <TextField label="Items" value={draft.items} error={errors.items} onChange={(items) => update({ items })} />
          <TextField label="Quantity" type="number" value={Number.isFinite(draft.quantity) ? String(draft.quantity) : ""} error={errors.quantity} onChange={(value) => update({ quantity: value === "" ? Number.NaN : Number(value) })} />
          <TextField label="Amount (₹)" type="number" value={Number.isFinite(draft.amount) ? String(draft.amount) : ""} error={errors.amount} onChange={(value) => update({ amount: value === "" ? Number.NaN : Number(value) })} />
          <SelectField label="Payment" value={draft.payment} options={["Paid", "Unpaid"]} onChange={(payment) => update({ payment: payment as CanteenOrder["payment"] })} />
          <SelectField label="Order status" value={draft.status} options={["Pending", "Preparing", "Served", "Cancelled"]} onChange={(status) => update({ status: status as CanteenOrder["status"] })} />
        </div>
      )}
      view={(row) => <p className="text-sm">{row.orderNo} · {formatDisplayDate(row.date)} · {row.items} · Qty {row.quantity} · {formatPrice(row.amount)} · {row.payment} · {row.status}</p>}
    />
  );
}

export function WalletPage() {
  const rows = useWalletTxns();
  const credits = rows.filter((row) => row.kind === "Credit").reduce((sum, row) => sum + row.amount, 0);
  const debits = rows.filter((row) => row.kind === "Debit").reduce((sum, row) => sum + row.amount, 0);
  return (
    <RecordWorkspace<WalletTxn>
      title="Mail / Wallet"
      description="Staff canteen wallet activity. Credits and debits below are a browser sample, not a school balance."
      crumb="Mail / Wallet"
      items={rows}
      searchLabel="Search wallet activity"
      summary={<StatCards cards={[{ label: "Balance", value: formatPrice(credits - debits) }, { label: "Credits", value: formatPrice(credits) }, { label: "Debits", value: formatPrice(debits) }]} />}
      match={(row, query) => !query || `${row.description} ${row.kind}`.toLowerCase().includes(query)}
      recordName={(row) => row.description}
      createLabel="Add transaction"
      columns={[
        { header: "Date", cell: (row) => formatDisplayDate(row.date) },
        { header: "Description", cell: (row) => row.description },
        { header: "Type", cell: (row) => <Badge variant={row.kind === "Credit" ? "success" : "danger"}>{row.kind}</Badge> },
        { header: "Amount", cell: (row) => formatPrice(row.amount) },
      ]}
      blank={() => ({ id: "", date: "2026-10-22", description: "", kind: "Debit", amount: Number.NaN })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const description = textRequired(draft.description, "a description");
        const amount = numberRequired(draft.amount, "amount");
        if (description) errors.description = description;
        if (amount) errors.amount = amount;
        return errors;
      }}
      onSave={saveWalletTxn}
      onDelete={removeWalletTxn}
      form={(draft, update, errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Date" type="date" value={draft.date} onChange={(date) => update({ date })} />
          <SelectField label="Type" value={draft.kind} options={["Credit", "Debit"]} onChange={(kind) => update({ kind: kind as WalletTxn["kind"] })} />
          <TextField label="Description" value={draft.description} error={errors.description} onChange={(description) => update({ description })} />
          <TextField label="Amount (₹)" type="number" value={Number.isFinite(draft.amount) ? String(draft.amount) : ""} error={errors.amount} onChange={(value) => update({ amount: value === "" ? Number.NaN : Number(value) })} />
        </div>
      )}
      view={(row) => <p className="text-sm">{formatDisplayDate(row.date)} · {row.kind} · {formatPrice(row.amount)} · {row.description}</p>}
    />
  );
}

export function StockPage() {
  const rows = useStockUses();
  return (
    <RecordWorkspace<StockUse>
      title="Stock Consumption"
      description="Quantities used in the kitchen and what remains after each entry."
      crumb="Stock Consumption"
      items={rows}
      searchLabel="Search stock"
      match={(row, query) => !query || row.item.toLowerCase().includes(query)}
      recordName={(row) => row.item}
      createLabel="Add consumption"
      columns={[
        { header: "Item", cell: (row) => row.item },
        { header: "Consumed", cell: (row) => row.quantity },
        { header: "Date", cell: (row) => formatDisplayDate(row.date) },
        { header: "Remaining", cell: (row) => row.remaining },
      ]}
      blank={() => ({ id: "", item: "", quantity: Number.NaN, date: "2026-10-22", remaining: Number.NaN })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const item = textRequired(draft.item, "the item");
        const quantity = numberRequired(draft.quantity, "consumed quantity");
        const remaining = numberRequired(draft.remaining, "remaining stock");
        if (item) errors.item = item;
        if (quantity) errors.quantity = quantity;
        if (remaining) errors.remaining = remaining;
        return errors;
      }}
      onSave={saveStockUse}
      onDelete={removeStockUse}
      form={(draft, update, errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Item" value={draft.item} error={errors.item} onChange={(item) => update({ item })} />
          <TextField label="Date" type="date" value={draft.date} onChange={(date) => update({ date })} />
          <TextField label="Consumed" type="number" value={Number.isFinite(draft.quantity) ? String(draft.quantity) : ""} error={errors.quantity} onChange={(value) => update({ quantity: value === "" ? Number.NaN : Number(value) })} />
          <TextField label="Remaining" type="number" value={Number.isFinite(draft.remaining) ? String(draft.remaining) : ""} error={errors.remaining} onChange={(value) => update({ remaining: value === "" ? Number.NaN : Number(value) })} />
        </div>
      )}
      view={(row) => <p className="text-sm">{row.item} · used {row.quantity} on {formatDisplayDate(row.date)} · {row.remaining} remaining</p>}
    />
  );
}

export function PurchasePage() {
  const rows = usePurchases();
  return (
    <RecordWorkspace<PurchaseRow>
      title="Food Purchase"
      description="Purchases from suppliers, with quantity, cost, and date."
      crumb="Food Purchase"
      items={rows}
      searchLabel="Search purchases"
      match={(row, query) => !query || `${row.supplier} ${row.item}`.toLowerCase().includes(query)}
      recordName={(row) => `${row.item} · ${row.supplier}`}
      createLabel="Add purchase"
      columns={[
        { header: "Supplier", cell: (row) => row.supplier },
        { header: "Item", cell: (row) => row.item },
        { header: "Quantity", cell: (row) => row.quantity },
        { header: "Cost", cell: (row) => formatPrice(row.cost) },
        { header: "Date", cell: (row) => formatDisplayDate(row.date) },
      ]}
      blank={() => ({ id: "", supplier: "", item: "", quantity: Number.NaN, cost: Number.NaN, date: "2026-10-22" })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const supplier = textRequired(draft.supplier, "the supplier");
        const item = textRequired(draft.item, "the item");
        const quantity = numberRequired(draft.quantity, "quantity");
        const cost = numberRequired(draft.cost, "cost");
        if (supplier) errors.supplier = supplier;
        if (item) errors.item = item;
        if (quantity) errors.quantity = quantity;
        if (cost) errors.cost = cost;
        return errors;
      }}
      onSave={savePurchase}
      onDelete={removePurchase}
      form={(draft, update, errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Supplier" value={draft.supplier} error={errors.supplier} onChange={(supplier) => update({ supplier })} />
          <TextField label="Item" value={draft.item} error={errors.item} onChange={(item) => update({ item })} />
          <TextField label="Quantity" type="number" value={Number.isFinite(draft.quantity) ? String(draft.quantity) : ""} error={errors.quantity} onChange={(value) => update({ quantity: value === "" ? Number.NaN : Number(value) })} />
          <TextField label="Cost (₹)" type="number" value={Number.isFinite(draft.cost) ? String(draft.cost) : ""} error={errors.cost} onChange={(value) => update({ cost: value === "" ? Number.NaN : Number(value) })} />
          <TextField label="Date" type="date" value={draft.date} onChange={(date) => update({ date })} />
        </div>
      )}
      view={(row) => <p className="text-sm">{row.supplier} · {row.item} · Qty {row.quantity} · {formatPrice(row.cost)} · {formatDisplayDate(row.date)}</p>}
    />
  );
}

export function SafetyPage() {
  const rows = useSafetyChecks();
  return (
    <RecordWorkspace<SafetyCheck>
      title="Food Safety / Compliance"
      description="Hygiene checks, inspections, expiry dates, and compliance status."
      crumb="Food Safety / Compliance"
      items={rows}
      searchLabel="Search checks"
      match={(row, query) => !query || `${row.check} ${row.area} ${row.inspector} ${row.status}`.toLowerCase().includes(query)}
      recordName={(row) => row.check}
      createLabel="Add check"
      columns={[
        { header: "Check", cell: (row) => row.check },
        { header: "Area", cell: (row) => row.area },
        { header: "Inspector", cell: (row) => row.inspector },
        { header: "Checked", cell: (row) => formatDisplayDate(row.date) },
        { header: "Expiry", cell: (row) => formatDisplayDate(row.expiry) },
        { header: "Status", cell: (row) => <Badge variant={row.status === "Compliant" ? "success" : row.status === "Due" ? "warning" : "danger"}>{row.status}</Badge> },
      ]}
      blank={() => ({ id: "", check: "", area: "", inspector: "", date: "2026-10-22", expiry: "2026-11-22", status: "Due" })}
      copy={(row) => ({ ...row })}
      validate={(draft) => {
        const errors: Record<string, string> = {};
        const check = textRequired(draft.check, "the check");
        const area = textRequired(draft.area, "the area");
        const inspector = textRequired(draft.inspector, "the inspector");
        if (check) errors.check = check;
        if (area) errors.area = area;
        if (inspector) errors.inspector = inspector;
        if (draft.expiry < draft.date) errors.expiry = "Expiry must be on or after the check date.";
        return errors;
      }}
      onSave={saveSafetyCheck}
      onDelete={removeSafetyCheck}
      form={(draft, update, errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Check" value={draft.check} error={errors.check} onChange={(check) => update({ check })} />
          <TextField label="Area" value={draft.area} error={errors.area} onChange={(area) => update({ area })} />
          <TextField label="Inspector" value={draft.inspector} error={errors.inspector} onChange={(inspector) => update({ inspector })} />
          <SelectField label="Status" value={draft.status} options={["Compliant", "Due", "Overdue"]} onChange={(status) => update({ status: status as SafetyCheck["status"] })} />
          <TextField label="Checked on" type="date" value={draft.date} onChange={(date) => update({ date })} />
          <TextField label="Expiry" type="date" value={draft.expiry} error={errors.expiry} onChange={(expiry) => update({ expiry })} />
        </div>
      )}
      view={(row) => <p className="text-sm">{row.check} · {row.area} · {row.inspector} · {formatDisplayDate(row.date)} to {formatDisplayDate(row.expiry)} · {row.status}</p>}
    />
  );
}

const REPORTS = ["Sales", "Orders", "Purchases", "Stock", "Consumption", "Food items"] as const;

export function CanteenReportPage() {
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-10-31");
  const [kind, setKind] = useState<(typeof REPORTS)[number]>("Sales");
  const orders = useCanteenOrders();
  const purchases = usePurchases();
  const stock = useStockUses();
  const { items } = useCanteenState();
  const rangedOrders = orders.filter((order) => inDateRange(order.date, from, to));
  const rangedPurchases = purchases.filter((row) => inDateRange(row.date, from, to));
  const rangedStock = stock.filter((row) => inDateRange(row.date, from, to));
  const sales = rangedOrders.filter((order) => order.payment === "Paid" && order.status !== "Cancelled").reduce((sum, order) => sum + order.amount, 0);
  const purchaseCost = rangedPurchases.reduce((sum, row) => sum + row.cost, 0);
  const consumed = rangedStock.reduce((sum, row) => sum + row.quantity, 0);

  const table = (() => {
    if (kind === "Sales" || kind === "Orders") {
      return {
        headers: ["Order", "Date", "Items", "Amount", "Payment", "Status"],
        rows: rangedOrders.map((order) => [order.orderNo, formatDisplayDate(order.date), order.items, formatPrice(order.amount), order.payment, order.status]),
      };
    }
    if (kind === "Purchases") {
      return {
        headers: ["Supplier", "Item", "Quantity", "Cost", "Date"],
        rows: rangedPurchases.map((row) => [row.supplier, row.item, String(row.quantity), formatPrice(row.cost), formatDisplayDate(row.date)]),
      };
    }
    if (kind === "Consumption") {
      return {
        headers: ["Item", "Consumed", "Remaining", "Date"],
        rows: rangedStock.map((row) => [row.item, String(row.quantity), String(row.remaining), formatDisplayDate(row.date)]),
      };
    }
    if (kind === "Stock") {
      return {
        headers: ["Item", "Remaining"],
        rows: stock.map((row) => [row.item, String(row.remaining)]),
      };
    }
    return {
      headers: ["Item", "Price", "Stock", "Status", "Orders mentioning it"],
      rows: items.map((item) => [
        item.name,
        formatPrice(item.price),
        String(item.stock),
        item.active ? "Active" : "Inactive",
        String(orders.filter((order) => order.items.toLowerCase().includes(item.name.toLowerCase())).length),
      ]),
    };
  })();

  return (
    <PageContainer
      title="Canteen Report"
      description="Sample sales, orders, purchases, stock, consumption, and food item performance for the selected dates."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Canteen / Cafeteria", href: "/app/canteen" }, { label: "Canteen Report" }]}
    >
      <MockCaption>This report is calculated in the browser from the sample canteen records.</MockCaption>
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="From" type="date" value={from} onChange={setFrom} />
        <TextField label="To" type="date" value={to} onChange={setTo} />
        <SelectField label="Report" value={kind} options={[...REPORTS]} onChange={(value) => setKind(value as (typeof REPORTS)[number])} />
      </div>
      <StatCards
        cards={[
          { label: "Sales", value: formatPrice(sales) },
          { label: "Orders", value: rangedOrders.length },
          { label: "Purchase cost", value: formatPrice(purchaseCost) },
          { label: "Consumed units", value: consumed },
        ]}
      />
      {table.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rows in this date range.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                {table.headers.map((header) => (
                  <th key={header} scope="col" className="px-3 py-3 font-medium">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.join("-")} className="border-b border-border last:border-0">
                  {row.map((cell, index) => (
                    <td key={`${table.headers[index]}-${cell}`} className="px-3 py-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
