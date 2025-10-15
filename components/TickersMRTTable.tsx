"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type { DividendLite } from "@/types/upcoming";
import numeral from "numeral";
import { formatFrequency, freqRank } from "@/lib/format";
import { TextField, InputAdornment, Box } from "@mui/material";

type Props = { rows: DividendLite[] };
// Extend the row with a computed field
type RowWithEst = DividendLite & { estimated_cash?: number | null };
export default function TickersMRTTable({ rows }: Props) {
  const [investAmount, setInvestAmount] = useState<number>(10000);

  // Build derived data anytime rows or investAmount changes
  const derivedRows: RowWithEst[] = useMemo(() => {
    return rows.map((r) => {
      const pct = r.computed_return; // e.g. 0.035
      // Option A: % based
      const est =
        pct == null || isNaN(investAmount) ? null : investAmount * pct;

      // Option B (shares-based) – use this instead if preferred:
      // const price = r.current_price_per_share ?? 0;
      // const div = r.per_share ?? 0;
      // const est =
      //   !price || !div || isNaN(investAmount)
      //     ? null
      //     : Math.floor(investAmount / price) * div;

      return { ...r, estimated_cash: est };
    });
  }, [rows, investAmount]);

  const columns = useMemo<MRT_ColumnDef<DividendLite>[]>(
    () => [
      {
        header: "Ticker",
        accessorKey: "ticker",
        size: 110,
        Cell: ({ row }) => (
          <span className="font-medium">{row.original.ticker}</span>
        ),
      },
      {
        header: "Div",
        accessorKey: "per_share",
        size: 75,
        enableGrouping: false,
        Cell: ({ cell }) => {
          const v = cell.getValue<number | null>();
          return v == null ? "—" : numeral(v).format("$0.00");
        },
      },
      {
        header: "Price",
        size: 100,
        accessorKey: "current_price_per_share",
        Cell: ({ cell }) => {
          const v = cell.getValue<number | null>();
          return v == null ? "—" : numeral(v).format("$0.00");
        },
      },
      {
        header: "Est. %",
        size: 110,
        accessorKey: "computed_return",
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue<number | null>(columnId);
          const b = rowB.getValue<number | null>(columnId);
          if (a == null && b == null) return 0;
          if (a == null) return 1;
          if (b == null) return -1;
          return a - b;
        },
        Cell: ({ cell }) => {
          const v = cell.getValue<number | null>();
          return v == null ? "—" : numeral(v).format("0.00%");
        },
      },
      // NEW: Estimated payout in dollars for the entered investment amount
      {
        header: "Est. $",
        id: "estimated_cash",
        size: 120,
        accessorFn: (row) => {
          const price = row.current_price_per_share; // expected cash % for the period
          const div = row.per_share;
          if (price == null || div == null || isNaN(investAmount)) return null;
          return (investAmount / price) * div;

          // If you prefer shares-based cash for the next payout, use this instead:
          // const price = row.current_price_per_share ?? 0;
          // const div = row.per_share ?? 0;
          // if (!price || !div) return null;
          // const shares = Math.floor(investAmount / price);
          // return shares * div;
        },
        Cell: ({ cell }) => {
          const v = cell.getValue<number | null>();
          return v == null ? "—" : numeral(v).format("$0,0.00");
        },
        // keep nulls at bottom if you sort this column
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue<number | null>(columnId);
          const b = rowB.getValue<number | null>(columnId);
          if (a == null && b == null) return 0;
          if (a == null) return 1;
          if (b == null) return -1;
          return a - b;
        },
      },
      {
        header: "Freq",
        accessorKey: "frequency",
        size: 130,
        Cell: ({ cell }) =>
          `${formatFrequency(cell.getValue<number | null>())} (${cell.getValue<number | null>()})`,
        sortingFn: (a, b, id) => {
          const ar = freqRank(a.getValue<number | null>(id));
          const br = freqRank(b.getValue<number | null>(id));
          return ar - br;
        },
        filterVariant: "select",
      },
      { header: "Ex Date", accessorKey: "ex_dividend_date", size: 120 },
      { header: "Pay Date", accessorKey: "payment_date", size: 120 },
      { header: "Name", accessorKey: "name", size: 500 },
    ],
    [investAmount], // IMPORTANT: re-compute the column when the input changes
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={derivedRows}
      enableStickyHeader
      enableColumnResizing
      enableColumnFilters
      enableDensityToggle
      enableFullScreenToggle
      initialState={{
        sorting: [{ id: "computed_return", desc: true }],
        pagination: { pageIndex: 0, pageSize: 10 },
        density: "compact",
      }}
      muiTableContainerProps={{ sx: { borderRadius: "16px" } }}
      muiTablePaperProps={{ elevation: 2, sx: { borderRadius: "16px" } }}
      muiTableBodyCellProps={({ column, cell }) => {
        if (column.id !== "computed_return") return {};
        const v = cell.getValue<number | null>();
        if (v == null) return {};
        return {
          sx: {
            color: v >= 0 ? "success.main" : "error.main",
            fontWeight: 600,
          },
        };
      }}
      // Renders a control inside the table's top toolbar
      renderTopToolbarCustomActions={() => (
        <Box sx={{ p: 1 }}>
          <TextField
            type="number"
            label="Investment amount ($)"
            variant="outlined"
            value={investAmount}
            onChange={(e) => setInvestAmount(Number(e.target.value) || 0)}
            size="small"
          />
        </Box>
      )}
    />
  );
}
