export function StatCards({ cards }: { cards: { label: string; value: string | number }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
