"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { MockCaption } from "@/components/ui/MockCaption";
import { useCanteenState } from "@/modules/canteen/data/menu";
import {
  useCanteenOrders,
  useMenuEntries,
  usePurchases,
  useSafetyChecks,
  useStockUses,
  formatDisplayDate,
} from "@/modules/canteen/data/records";
import { StatCards } from "@/modules/canteen/components/StatCards";
import { formatPrice } from "@/modules/canteen/utils/menu";

export function CanteenDashboardPage() {
  const { items } = useCanteenState();
  const menus = useMenuEntries();
  const orders = useCanteenOrders();
  const purchases = usePurchases();
  const stock = useStockUses();
  const safety = useSafetyChecks();
  const sales = orders.filter((order) => order.payment === "Paid" && order.status !== "Cancelled").reduce((sum, order) => sum + order.amount, 0);
  const pending = orders.filter((order) => order.status === "Pending").length;
  const stockLeft = stock.reduce((sum, row) => sum + row.remaining, 0);
  const byDate = new Map<string, number>();
  orders.forEach((order) => {
    if (order.status === "Cancelled") return;
    byDate.set(order.date, (byDate.get(order.date) ?? 0) + order.amount);
  });
  const bars = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  const peak = Math.max(...bars.map(([, amount]) => amount), 1);
  const lowStock = items.filter((item) => item.active && item.stock < 10);

  return (
    <PageContainer
      title="Canteen Dashboard"
      description="Orders, sales, food items, menus, stock, and checks for the school canteen."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Canteen / Cafeteria", href: "/app/canteen" }, { label: "Canteen Dashboard" }]}
    >
      <MockCaption>Figures on this page are sample totals in this browser. They are not school accounts.</MockCaption>
      <StatCards
        cards={[
          { label: "Total orders", value: orders.length },
          { label: "Sales", value: formatPrice(sales) },
          { label: "Food items", value: items.length },
          { label: "Active menu items", value: menus.filter((entry) => entry.active).length },
          { label: "Stock on hand", value: stockLeft },
          { label: "Pending orders", value: pending },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Sales by day</h2>
          <p className="mt-1 text-sm text-muted-foreground">Paid and unpaid orders, excluding cancelled orders.</p>
          <ul className="mt-4 space-y-3">
            {bars.map(([date, amount]) => (
              <li key={date}>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{formatDisplayDate(date)}</span>
                  <span>{formatPrice(amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(8, (amount / peak) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Needs attention</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{lowStock.length} active food {lowStock.length === 1 ? "item is" : "items are"} below 10 in stock.</li>
            <li>{purchases.length} purchase records are in this browser.</li>
            <li>{safety.filter((check) => check.status !== "Compliant").length} safety checks are due or overdue.</li>
            <li>{pending} {pending === 1 ? "order is" : "orders are"} still pending.</li>
          </ul>
          {lowStock.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {lowStock.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                  <span>{item.name}</span>
                  <span className="tabular-nums text-muted-foreground">Stock {item.stock}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </PageContainer>
  );
}
