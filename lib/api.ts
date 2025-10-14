import type { UpcomingResponse } from "@/types/upcoming";

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api` || "";

export async function fetchUpcomingEx(
  days = 7,
  includeToday = false,
): Promise<UpcomingResponse> {
  const url = `${BASE}/dividends/upcoming/ex?days=${days}&include_today=${includeToday ? "true" : "false"}`;
  const res = await fetch(url, { cache: "no-store" }); // or { next: { revalidate: 300 } }
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<UpcomingResponse>;
}
