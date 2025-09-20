"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Boxes, Pencil, Search, Trash2 } from "lucide-react";

import type { Item, ItemTableQuery, PageResult } from "@/types/item";

type InventoryItem = Item & {
  images?: { url: string }[];
};

const conditionLabel: Record<NonNullable<InventoryItem["condition"]>, string> = {
  NEW: "Baru",
  GOOD: "Baik",
  DEFECT: "Cacat",
  BROKEN: "Rusak",
};

type InventoryTableProps = {
  initial: PageResult<Item>;
  initialQuery: ItemTableQuery;
};

export function InventoryTable({ initial, initialQuery }: InventoryTableProps) {
  const [data, setData] = useState<InventoryItem[]>(() => initial.rows as InventoryItem[]);
  const [globalFilter, setGlobalFilter] = useState(initialQuery.q ?? "");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
    unitPrice: false,
    purchasedAt: false,
    fundingSource: false,
    location: false,
    floor: false,
    room: false,
    rack: false,
    pic: false,
    lastCheckedAt: false,
    images: false,
  });

  useEffect(() => {
    setData(initial.rows as InventoryItem[]);
  }, [initial.rows]);

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        header: "Nama Barang",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="font-semibold text-[#216B5B]">{row.getValue<string>("name")}</div>
        ),
      },
      {
        header: "Kategori Barang",
        accessorKey: "category",
        cell: ({ row }) => row.getValue<string | null>("category") ?? "-",
      },
      {
        header: "Merk/Model",
        accessorKey: "brand",
        cell: ({ row }) => row.getValue<string | null>("brand") ?? "-",
      },
      {
        header: "Jumlah Barang",
        accessorKey: "quantity",
        cell: ({ row }) => (
          <span className="rounded-full bg-[#EAF6EE] px-3 py-1 text-xs font-semibold text-[#216B5B]">
            {row.getValue<number>("quantity")} unit
          </span>
        ),
      },
      {
        header: "Kondisi Barang",
        accessorKey: "condition",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[#343B38]">
            {conditionLabel[row.getValue<InventoryItem["condition"]>("condition")]}
          </span>
        ),
      },
      {
        header: "QR/Barcode Barang",
        accessorFn: (row) => row.qrPayload || row.barcodePayload || "-",
        cell: ({ row }) => {
          const qr = row.original.qrPayload;
          const barcode = row.original.barcodePayload;
          return (
            <div className="flex flex-col gap-1 text-xs">
              <span className="rounded-full bg-[#EAF2FD] px-3 py-1 font-medium text-[#185AB6]">
                QR: {qr ?? "-"}
              </span>
              <span className="rounded-full bg-[#FFF7E6] px-3 py-1 font-medium text-[#B97C00]">
                Barcode: {barcode ?? "-"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: () => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[#216B5B] px-3 py-1 text-xs font-semibold text-[#216B5B] transition hover:bg-[#EAF6EE]"
            >
              <Pencil className="h-3.5 w-3.5" /> Update
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[#A83232] px-3 py-1 text-xs font-semibold text-[#A83232] transition hover:bg-[#F6B8B8]/40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        ),
      },
      {
        header: "Foto Barang",
        accessorKey: "images",
        cell: ({ row }) => row.original.images?.[0]?.url ?? "-",
      },
      {
        header: "Deskripsi Barang",
        accessorKey: "description",
      },
      {
        header: "Harga Barang",
        accessorKey: "unitPrice",
      },
      {
        header: "Waktu Beli",
        accessorKey: "purchasedAt",
      },
      {
        header: "Sumber Dana",
        accessorKey: "fundingSource",
      },
      {
        header: "Lokasi Barang",
        accessorKey: "location",
      },
      {
        header: "Penanggung Jawab",
        accessorKey: "pic",
      },
      {
        header: "Tanggal Terakhir Diperiksa",
        accessorKey: "lastCheckedAt",
      },
      {
        header: "Lantai",
        accessorKey: "floor",
      },
      {
        header: "Ruangan",
        accessorKey: "room",
      },
      {
        header: "Rak/Lemari",
        accessorKey: "rack",
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#216B5B]">Inventori Terdata</p>
          <h2 className="text-xl font-semibold text-[#2E6431]">Daftar Barang</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#CFE6D6] bg-[#EAF6EE] px-4 py-2 text-sm text-[#216B5B]">
          <Boxes className="h-4 w-4" /> {data.length} item tercatat
        </div>
      </header>

      <div className="flex flex-col gap-4 rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#216B5B]" />
            <input
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Cari nama atau kategori..."
              className="w-full rounded-full border border-[#CFE6D6] bg-[#EAF6EE] py-2 pl-10 pr-4 text-sm text-[#343B38] focus:border-[#36AF30] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[#3E4643]">
            <span className="rounded-full bg-[#EAF2FD] px-3 py-1 text-[#185AB6]">Kolom tersembunyi siap ditampilkan lewat konfigurasi lanjutan.</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-y-2">
            <thead className="text-left text-xs uppercase tracking-widest text-[#216B5B]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="rounded-lg bg-[#EAF6EE] px-4 py-3 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-10 text-center text-sm text-[#3E4643]">
                    Tidak ada data inventori yang ditemukan.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="rounded-xl border border-[#CFE6D6] bg-[#FDFEFE] shadow-sm">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-top text-sm text-[#343B38]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
