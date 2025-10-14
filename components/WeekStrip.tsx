"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import numeral from "numeral";

type Tile = {
  dateISO: string;
  weekday: string;
  count: number;
  highest?: number | null;
  avgTop5?: number | null;
  avgAll?: number | null;
};

export default function WeekStrip({ tiles }: { tiles: Tile[] }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  if (!tiles?.length) return null;

  const selected = sp?.get("d") ?? tiles[0].dateISO;

  const fmtPct = (v?: number | null) =>
    v == null || !Number.isFinite(v) ? "—" : numeral(v).format("0.00%");

  // --- Mobile: compact dropdown (show only Day + count) ---
  const onSelect = (val: string) => {
    // preserve other params, change only `d`
    const params = new URLSearchParams(sp?.toString());
    params.set("d", val);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <label
          htmlFor="week-select"
          className="block text-sm text-gray-600 mb-1"
        >
          Select day
        </label>
        <select
          id="week-select"
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          {tiles.map((t) => (
            <option key={t.dateISO} value={t.dateISO}>
              {t.weekday} • {t.count} {t.count === 1 ? "ticker" : "tickers"} •{" "}
              {fmtPct(t.highest)} highest • {fmtPct(t.avgTop5)} Top 5 •{" "}
              {fmtPct(t.avgAll)} Avg
            </option>
          ))}
        </select>
      </div>

      {/* Desktop/tablet tiles */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-5 gap-3">
        {tiles.map((t, inx) => {
          const active = selected === t.dateISO;
          const isMonday = t.weekday === "Monday";
          const klass = [
            "rounded-2xl p-4 shadow bg-white border transition",
            isMonday ? "shadow shadow-orange-500" : "",
            active
              ? "border-blue-500 ring-2 ring-blue-400"
              : "border-gray-200 hover:border-gray-300",
          ].join(" ");

          return (
            <Link key={t.dateISO} href={`/?d=${t.dateISO}`} className={klass}>
              <div className={"text-sm text-gray-500"}>{t.weekday}</div>
              <div className="text-lg font-semibold">{t.dateISO}</div>
              <div className="mt-2 text-sm">
                <span className="font-medium">{t.count}</span>{" "}
                {t.count === 1 ? "ticker" : "tickers"}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <span className="block text-gray-400">Highest</span>
                  {fmtPct(t.highest)}
                </div>
                <div>
                  <span className="block text-gray-400">Avg Top 5</span>
                  {fmtPct(t.avgTop5)}
                </div>
                <div>
                  <span className="block text-gray-400">Avg All</span>
                  {fmtPct(t.avgAll)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
