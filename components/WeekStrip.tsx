"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import numeral from "numeral";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";

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
  const theme = useTheme();

  if (!tiles?.length) return null;

  const selected = sp?.get("d") ?? tiles[0].dateISO;

  const fmtPct = (v?: number | null) =>
    v == null || !Number.isFinite(v) ? "—" : numeral(v).format("0.00%");

  const buildHref = (val: string) => {
    const params = new URLSearchParams(sp?.toString());
    params.set("d", val);
    return `${pathname}?${params.toString()}`;
  };

  const onSelect = (val: string) => router.push(buildHref(val));

  return (
    <div>
      {/* Mobile: MUI Select, but layout with div/Tailwind */}
      <div className="sm:hidden mb-2">
        <FormControl fullWidth size="small">
          <InputLabel id="week-select-label">Select day</InputLabel>
          <Select
            labelId="week-select-label"
            id="week-select"
            label="Select day"
            value={selected}
            onChange={(e) => onSelect(e.target.value as string)}
          >
            {tiles.map((t) => (
              <MenuItem key={t.dateISO} value={t.dateISO}>
                {t.weekday} • {t.count} {t.count === 1 ? "ticker" : "tickers"} •{" "}
                {fmtPct(t.highest)} highest • {fmtPct(t.avgTop5)} Top 5 •{" "}
                {fmtPct(t.avgAll)} Avg
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Desktop/tablet: div-based grid with Tailwind; cards are MUI */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-5 gap-3">
        {tiles.map((t) => {
          const active = selected === t.dateISO;
          const isMonday = t.weekday === "Monday";

          return (
            <Card
              key={t.dateISO}
              variant="outlined"
              className={[
                "rounded-2xl", // keep rounded via class (MUI respects)
              ].join(" ")}
              sx={{
                borderRadius: 3,
                borderColor: active ? "primary.main" : "divider",
                boxShadow: isMonday
                  ? `0 0 0 1px ${theme.palette.warning.main}`
                  : undefined,
                ...(active && {
                  outline: `2px solid ${theme.palette.primary.light}`,
                  outlineOffset: 0,
                }),
                transition: "border-color 0.15s ease",
                "&:hover": { borderColor: "text.secondary" },
              }}
            >
              <CardActionArea
                component={Link}
                href={buildHref(t.dateISO)}
                sx={{ borderRadius: 3 }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {t.weekday}
                  </Typography>

                  <Typography variant="subtitle1" fontWeight={600}>
                    {t.dateISO}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <span className="font-medium">{t.count}</span>{" "}
                    {t.count === 1 ? "ticker" : "tickers"}
                  </Typography>

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
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
