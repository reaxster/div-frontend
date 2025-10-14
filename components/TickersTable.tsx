import type { DividendLite } from "@/types/upcoming";

export default function TickersTable({ rows }: { rows: DividendLite[] }) {
  if (!rows?.length)
    return (
      <div className="mt-6 text-sm text-gray-500">
        No tickers for this date.
      </div>
    );

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Ticker</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-right">Per Share</th>
            <th className="px-3 py-2 text-right">Price</th> {/* NEW */}
            <th className="px-3 py-2 text-right">Est. Return</th> {/* NEW */}
            <th className="px-3 py-2 text-left">Currency</th>
            <th className="px-3 py-2 text-left">Frequency</th>
            <th className="px-3 py-2 text-left">Payment Date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={`${r.ex_dividend_date}-${r.ticker}`}>
              <td className="px-3 py-2 font-medium">{r.ticker}</td>
              <td className="px-3 py-2">{r.name ?? ""}</td>
              <td className="px-3 py-2 text-right">
                {r.per_share != null ? r.per_share.toFixed(6) : "—"}
              </td>
              <td className="px-3 py-2 text-right">
                {r.current_price_per_share != null
                  ? r.current_price_per_share.toFixed(2)
                  : "—"}
              </td>
              <td className="px-3 py-2 text-right">
                {r.computed_return != null
                  ? `${(r.computed_return * 100).toFixed(2)}%`
                  : "—"}
              </td>
              <td className="px-3 py-2">{r.currency ?? ""}</td>
              <td className="px-3 py-2">{r.frequency ?? ""}</td>
              <td className="px-3 py-2">{r.payment_date ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
