"use client";

import * as React from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useMemo } from "react";
import type { DividendLite } from "@/types/upcoming";
import numeral from "numeral";
import { formatFrequency, freqRank } from "@/lib/format";

type Props = { rows: DividendLite[] };

export default function TickersMRTTable({ rows }: Props) {
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
        // Keep nulls at bottom, sort by value desc by default (set in initialState)
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue<number | null>(columnId);
          const b = rowB.getValue<number | null>(columnId);
          if (a == null && b == null) return 0;
          if (a == null) return 1; // a after b
          if (b == null) return -1; // a before b
          return a - b;
        },
        Cell: ({ cell }) => {
          const v = cell.getValue<number | null>();
          return v == null ? "—" : numeral(v).format("0.00%");
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
          return ar - br; // ascending by cadence rank; toggle desc in initialState if desired
        },
        filterVariant: "select",
        mantineSelectProps: {
          // if you use MUI just omit this; MRT will render a MUI Select
          // not needed for MUI; for MRT + MUI this becomes `muiTableHeadCellFilterTextFieldProps`
        },
        // Provide options for filter menu (MRT will infer from data, but you can be explicit)
        // enableColumnFilterModes: true, // optional advanced filtering
      },
      { header: "Ex Date", accessorKey: "ex_dividend_date", size: 120 },
      { header: "Pay Date", accessorKey: "payment_date", size: 120 },
      { header: "Name", accessorKey: "name", size: 500 },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={rows}
      enableStickyHeader
      enableColumnResizing
      enableColumnFilters
      enableDensityToggle
      enableFullScreenToggle
      initialState={{
        sorting: [{ id: "computed_return", desc: true }], // highest return first
        pagination: { pageIndex: 0, pageSize: 10 },
        density: "compact",
      }}
      muiTableContainerProps={{ sx: { borderRadius: "16px" } }}
      muiTablePaperProps={{ elevation: 2, sx: { borderRadius: "16px" } }}
      // Optional: highlight positive returns
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
    />
  );
}
