// lib/format.ts
export const FREQ_LABEL: Record<number, string> = {
  365: "Daily",
  52: "Weekly",
  26: "Biweekly",
  24: "Semi-monthly",
  12: "Monthly",
  6: "Bimonthly",
  4: "Quarterly",
  2: "Semiannual",
  1: "Annual",
};

export const FREQ_RANK: Record<number, number> = {
  365: 9,
  52: 8,
  26: 7,
  24: 6,
  12: 5,
  6: 4,
  4: 3,
  2: 2,
  1: 1,
};

export function formatFrequency(n?: number | null): string {
  if (n == null) return "—";
  return FREQ_LABEL[n] ?? `${n}×/yr`;
}

export function freqRank(n?: number | null): number {
  if (n == null) return -1; // push unknowns to bottom
  return FREQ_RANK[n] ?? 0; // unknowns below knowns
}
