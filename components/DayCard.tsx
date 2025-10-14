import type { UpcomingGroup } from "@/types/upcoming";

export default function DayCard({ group }: { group: UpcomingGroup }) {
  return (
    <div className="rounded-2xl bg-white shadow p-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">{group.weekday}</h3>
        <p className="text-sm text-gray-500">{group.date}</p>
      </div>

      {group.items.length === 0 ? (
        <div className="text-sm text-gray-400">No tickers</div>
      ) : (
        <ul className="divide-y">
          {group.items.map((it) => (
            <li
              key={`${group.date}-${it.ticker}`}
              className="py-2 flex items-center gap-3"
            >
              {it.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.logo_url}
                  alt={it.ticker}
                  className="h-6 w-6 rounded"
                />
              ) : (
                <div className="h-6 w-6 rounded bg-gray-200" />
              )}
              <div className="min-w-0">
                <div className="font-medium leading-tight">{it.ticker}</div>
                <div className="text-xs text-gray-500 truncate">
                  {it.name ?? ""}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm">
                  {it.per_share != null ? it.per_share.toFixed(6) : "-"}{" "}
                  {it.currency ?? ""}
                </div>
                <div className="text-xs text-gray-500">
                  {it.payment_date ? `Pay: ${it.payment_date}` : "Pay: —"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
