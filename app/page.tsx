import { fetchUpcomingEx } from "@/lib/api";
import { fiveTileWindow } from "@/lib/dates";
import WeekStrip from "@/components/WeekStrip";
import TickersMRTTable from "@/components/TickersMRTTable";
import MaxPotentialBanner from "@/components/MaxPotentialBanner";
import type { UpcomingResponse, DividendLite } from "@/types/upcoming";

type SP = { d?: string };

function statsForDay(items: DividendLite[]) {
  const vals = items
    .map((i) => i.computed_return)
    .filter((x): x is number => typeof x === "number" && Number.isFinite(x));

  if (!vals.length) {
    return { highest: null, avgTop5: null, avgAll: null };
  }

  const highest = Math.max(...vals);

  const top5 = vals
    .slice()
    .sort((a, b) => b - a)
    .slice(0, 5);
  const avgTop5 = top5.length
    ? top5.reduce((a, b) => a + b, 0) / top5.length
    : null;

  const avgAll = vals.reduce((a, b) => a + b, 0) / vals.length;

  return { highest, avgTop5, avgAll };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const data: UpcomingResponse = await fetchUpcomingEx(14, false);

  // Build date → items map
  const map = new Map<string, DividendLite[]>();
  for (const g of data.groups) map.set(g.date, g.items);

  // Our 5 business-day window (Tue, Wed, Thu, Fri, next Mon)
  const tilesDef = fiveTileWindow();

  // Build tiles with counts + metrics per day
  const tiles = tilesDef.map((t) => {
    const items = map.get(t.dateISO) ?? [];
    const s = statsForDay(items);
    return {
      dateISO: t.dateISO,
      weekday: t.weekday,
      count: items.length,
      highest: s.highest,
      avgTop5: s.avgTop5,
      avgAll: s.avgAll,
    };
  });

  // Banner total = sum of daily maxima across the 5 tiles
  const totalMax = tiles
    .map((t) => t.highest)
    .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
    .reduce((a, b) => a + b, 0);

  // Selected date default = first tile
  const selectedDate =
    (sp?.d && tiles.find((x) => x.dateISO === sp.d)?.dateISO) ||
    tiles[0]?.dateISO;

  const rows: DividendLite[] = selectedDate
    ? (map.get(selectedDate) ?? [])
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          Upcoming Ex-Dividends (Tue → Fri → Mon)
        </h1>
        <p className="text-sm text-gray-600">
          Source window: {data.start_date} → {data.end_date} ({data.timezone})
        </p>
      </header>

      <WeekStrip tiles={tiles} />
      <div className="my-6">
        <MaxPotentialBanner
          totalMax={Number.isFinite(totalMax) ? totalMax : null}
        />
      </div>

      <section className="mt-4">
        <h2 className="text-lg font-semibold">
          {selectedDate} —{" "}
          {tilesDef.find((t) => t.dateISO === selectedDate)?.weekday ?? ""}
        </h2>
        <div className="mt-4">
          <TickersMRTTable rows={rows} />
        </div>
      </section>
    </main>
  );
}
