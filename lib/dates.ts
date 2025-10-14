// Market-time utilities (ET / New York)
const NY_TZ = "America/New_York";
const OPEN_H = 9;
const OPEN_M = 30;

/** Get current NY wall-clock parts (24h). */
function nyNowParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: NY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
    hh: Number(parts.hour),
    mm: Number(parts.minute),
  };
}

/** Build a stable UTC anchor (noon UTC) for the NY calendar date. */
function nyDateAnchorUTC(y: number, m: number, d: number): Date {
  // UTC noon avoids DST jumps when adding whole days
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Add whole days from a UTC-noon anchor (DST-safe). */
export function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * 86_400_000);
}

/** Is the given NY weekday a weekend? (0=Sun..6=Sat) */
function isWeekendNY(weekday: number) {
  return weekday === 0 || weekday === 6;
}

/** Previous business day in NY (skip Sat/Sun). */
function prevBusinessDay(anchor: Date): Date {
  let d = addDays(anchor, -1);
  // Compute weekday in NY
  while (
    ["Sun", "Sat"].includes(
      d.toLocaleDateString("en-US", { weekday: "short", timeZone: NY_TZ }),
    )
  ) {
    d = addDays(d, -1);
  }
  return d;
}

/** NY "market day" anchor based on 09:30 ET. */
export function nyMarketDayAnchor(now = new Date()): Date {
  const { y, m, d, hh, mm } = nyNowParts(now);
  const todayAnchor = nyDateAnchorUTC(y, m, d);
  const beforeOpen = hh < OPEN_H || (hh === OPEN_H && mm < OPEN_M);
  return beforeOpen ? prevBusinessDay(todayAnchor) : todayAnchor;
}

/** YYYY-MM-DD for NY calendar date of given instant. */
export function toISODateNY(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Weekday name in NY. */
export function weekdayNameNY(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", timeZone: NY_TZ });
}

/** Weekday index in NY (0=Sun..6=Sat). */
function weekdayIndexNY(date: Date): number {
  const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    date.toLocaleDateString("en-US", { weekday: "short", timeZone: NY_TZ }),
  );
  return idx; // 0..6
}

/** Next Tuesday based on NY market day (keep same-day Tuesday). */
export function nextTuesdayStart(): Date {
  const start = nyMarketDayAnchor();
  const wd = weekdayIndexNY(start);
  const target = 2; // Tue
  const delta = (target - wd + 7) % 7;
  return addDays(start, delta === 0 ? 0 : delta);
}

/** Tue, Wed, Thu, Fri, next Mon (NY market days). */
export function fiveTileWindow(): { dateISO: string; weekday: string }[] {
  const tue = nextTuesdayStart();
  const wed = addDays(tue, 1);
  const thu = addDays(tue, 2);
  const fri = addDays(tue, 3);
  const mon = addDays(tue, 6); // Tue + 6 = next Mon
  return [tue, wed, thu, fri, mon].map((d) => ({
    dateISO: toISODateNY(d),
    weekday: weekdayNameNY(d),
  }));
}
