const TZ = "America/Chicago";

function chicagoToday(): Date {
  // Get "today" in Chicago without libraries
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(now)
    .reduce<Record<string, string>>(
      (acc, p) => (p.type !== "literal" && (acc[p.type] = p.value), acc),
      {},
    );
  return new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00`);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function toISODate(d: Date): string {
  // YYYY-MM-DD (no timezone)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekdayName(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", timeZone: TZ });
}

/** Next Tuesday strictly in the future (if today is Tue, use today’s Tue) is acceptable for pipeline.
 *  If you want strictly future-only, change offset 0→1 when wd === 2.
 */
export function nextTuesdayStart(): Date {
  const today = chicagoToday();
  const wd = today.getDay(); // Sun=0..Sat=6
  const target = 2; // Tuesday
  const delta = (target - wd + 7) % 7; // 0..6
  return addDays(today, delta === 0 ? 0 : delta);
}

/** Returns Tue, Wed, Thu, Fri, next Mon (skip weekend) */
export function fiveTileWindow(): { dateISO: string; weekday: string }[] {
  const startTue = nextTuesdayStart();
  const wed = addDays(startTue, 1);
  const thu = addDays(startTue, 2);
  const fri = addDays(startTue, 3);
  const monNext = addDays(startTue, 6); // Tue + 6 = next Monday (skip weekend)
  return [startTue, wed, thu, fri, monNext].map((d) => ({
    dateISO: toISODate(d),
    weekday: weekdayName(d),
  }));
}
