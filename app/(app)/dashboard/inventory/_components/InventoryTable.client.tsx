
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Table,
} from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { Boxes, ListFilter, Pencil, Search, Trash2 } from "lucide-react";

import type {
  Item,
  ItemTableFilter,
  ItemTableQuery,
  ItemTableSort,
  PageResult,
} from "@/types/item";

import { deleteItem, updateItem } from "../actions";
import { CellNumberEditable } from "./cells/CellNumberEditable";
import { CellSelectEditable } from "./cells/CellSelectEditable";
import { CellTextEditable } from "./cells/CellTextEditable";
import type { EditResult } from "./cells/types";
import { ModalEdit, type ModalPayload } from "./ModalEdit.client";

const STORAGE_KEYS = {
  visibility: "inv.columnVisibility",
  order: "inv.columnOrder",
} as const;

const DEFAULT_VISIBILITY: VisibilityState = {
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
};

type InventoryItem = Item & {
  images?: { url: string }[];
};

type InventoryTableProps = {
  initial: PageResult<Item>;
  initialQuery: ItemTableQuery;
};

type FilterDraft = {
  category: string;
  condition: string;
};

type ToastMessage = {
  id: number;
  tone: "success" | "error";
  message: string;
};

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Baru",
  GOOD: "Baik",
  DEFECT: "Cacat",
  BROKEN: "Rusak",
};

const CONDITION_OPTIONS = [
  { value: "NEW", label: CONDITION_LABEL.NEW },
  { value: "GOOD", label: CONDITION_LABEL.GOOD },
  { value: "DEFECT", label: CONDITION_LABEL.DEFECT },
  { value: "BROKEN", label: CONDITION_LABEL.BROKEN },
];

const normalizeFiltersDraft = (filters: ItemTableFilter[] | null | undefined): FilterDraft => {
  const draft: FilterDraft = { category: "", condition: "" };

  if (!Array.isArray(filters)) return draft;

  for (const filter of filters) {
    if (!filter || typeof filter !== "object") continue;
    if (filter.id === "category" && typeof filter.value === "string") {
      draft.category = filter.value;
    }
    if (filter.id === "condition" && typeof filter.value === "string") {
      draft.condition = filter.value;
    }
  }

  return draft;
};

const buildFiltersParam = (draft: FilterDraft): ItemTableFilter[] | null => {
  const filters: ItemTableFilter[] = [];

  if (draft.category.trim() !== "") {
    filters.push({ id: "category", value: draft.category.trim() });
  }

  if (draft.condition.trim() !== "") {
    filters.push({ id: "condition", value: draft.condition.trim() });
  }

  return filters.length > 0 ? filters : null;
};

const toSortingState = (sort: ItemTableSort[] | null | undefined): SortingState => {
  if (!Array.isArray(sort)) return [];
  return sort
    .filter((item): item is ItemTableSort => Boolean(item?.id))
    .map((item) => ({ id: item.id, desc: Boolean(item.desc) }));
};

const toFiltersState = (filters: ItemTableFilter[] | null | undefined): ColumnFiltersState => {
  if (!Array.isArray(filters)) return [];
  return filters.map((filter) => ({ id: filter.id, value: filter.value }));
};

const serializeSortParam = (sort: SortingState): ItemTableSort[] | null =>
  sort.length > 0 ? sort.map((item) => ({ id: item.id, desc: item.desc })) : null;

const areFiltersEqual = (
  a: ItemTableFilter[] | null,
  b: ItemTableFilter[] | null
) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((filter, index) => {
    const candidate = b[index];
    return candidate && candidate.id === filter.id && candidate.value === filter.value;
  });
};

const areSortsEqual = (
  a: ItemTableSort[] | null,
  b: ItemTableSort[] | null
) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((sort, index) => {
    const candidate = b[index];
    return (
      candidate &&
      candidate.id === sort.id &&
      Boolean(candidate.desc) === Boolean(sort.desc)
    );
  });
};

const cloneRows = (rows: InventoryItem[]): InventoryItem[] =>
  rows.map((row) => ({
    ...row,
    images: row.images ? row.images.map((image) => ({ ...image })) : undefined,
  }));

const ColumnPreferences = ({ table, onReset }: { table: Table<InventoryItem>; onReset: () => void }) => {
  const toggleColumn = useCallback(
    (columnId: string) => {
      const column = table.getAllLeafColumns().find((col) => col.id === columnId);
      if (column) {
        column.toggleVisibility(!column.getIsVisible());
      }
    },
    [table]
  );

  const moveColumn = useCallback(
    (columnId: string, direction: "up" | "down") => {
      const order = table.getState().columnOrder;
      const currentIndex = order.indexOf(columnId);
      if (currentIndex === -1) return;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= order.length) return;

      const nextOrder = [...order];
      [nextOrder[currentIndex], nextOrder[targetIndex]] = [
        nextOrder[targetIndex],
        nextOrder[currentIndex],
      ];

      table.setColumnOrder(nextOrder);
    },
    [table]
  );

  const leafColumns = table.getAllLeafColumns().filter((column) => column.getCanHide());

  return (
    <div className="space-y-3 rounded-2xl border border-[#CFE6D6] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#216B5B]">Preferensi Kolom</p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#185AB6] underline decoration-dotted"
        >
          Reset
        </button>
      </div>
      <div className="space-y-2 text-xs text-[#3E4643]">
        {leafColumns.map((column) => (
          <div
            key={column.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-[#F4FBF6] px-3 py-2"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={column.getIsVisible()}
                onChange={() => toggleColumn(column.id)}
                className="h-3.5 w-3.5 rounded border border-[#216B5B] text-[#216B5B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36AF30]"
              />
              <span className="font-medium text-[#2E6431]">
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id}
              </span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveColumn(column.id, "up")}
                className="rounded-full border border-[#CFE6D6] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#216B5B] transition hover:bg-[#EAF6EE]"
                aria-label={`Naikkan kolom ${column.columnDef.header as string}`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveColumn(column.id, "down")}
                className="rounded-full border border-[#CFE6D6] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#216B5B] transition hover:bg-[#EAF6EE]"
                aria-label={`Turunkan kolom ${column.columnDef.header as string}`}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export function InventoryTable({ initial, initialQuery }: InventoryTableProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [announcement, setAnnouncement] = useState("Tabel inventori siap.");
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, tone: ToastMessage["tone"]) => {
    setToast({ id: Date.now(), tone, message });
  }, []);

  const normalizedQuery = useMemo<ItemTableQuery>(() => ({
    cursor: initialQuery.cursor ?? null,
    pageSize: initialQuery.pageSize,
    sort: initialQuery.sort ?? null,
    filters: initialQuery.filters ?? null,
    q: initialQuery.q ?? null,
    history: initialQuery.history ?? null,
  }), [initialQuery]);

  const queryRef = useRef<ItemTableQuery>(normalizedQuery);

  useEffect(() => {
    queryRef.current = normalizedQuery;
  }, [normalizedQuery]);

  const [data, setData] = useState<InventoryItem[]>(() => initial.rows as InventoryItem[]);
  const dataRef = useRef<InventoryItem[]>(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    setData(initial.rows as InventoryItem[]);
    setAnnouncement(
      `Memuat ${initial.rows.length} baris inventori. ${initial.nextCursor ? "Data berikutnya siap diakses." : "Tidak ada halaman lanjutan."}`
    );
  }, [initial.rows, initial.nextCursor]);

  const [globalFilter, setGlobalFilter] = useState<string>(initialQuery.q ?? "");
  const [sorting, setSorting] = useState<SortingState>(() => toSortingState(initialQuery.sort));
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    toFiltersState(initialQuery.filters)
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ...DEFAULT_VISIBILITY,
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [filtersDraft, setFiltersDraft] = useState<FilterDraft>(() =>
    normalizeFiltersDraft(initialQuery.filters)
  );

  useEffect(() => {
    setGlobalFilter(initialQuery.q ?? "");
    setSorting(toSortingState(initialQuery.sort));
    setColumnFilters(toFiltersState(initialQuery.filters));
    setFiltersDraft(normalizeFiltersDraft(initialQuery.filters));
  }, [initialQuery.filters, initialQuery.q, initialQuery.sort]);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const rawVisibility = window.localStorage.getItem(STORAGE_KEYS.visibility);
      if (rawVisibility) {
        const parsed = JSON.parse(rawVisibility) as VisibilityState;
        setColumnVisibility((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // abaikan error parsing
    }

    try {
      const rawOrder = window.localStorage.getItem(STORAGE_KEYS.order);
      if (rawOrder) {
        const parsed = JSON.parse(rawOrder) as ColumnOrderState;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setColumnOrder(parsed);
        }
      }
    } catch {
      // abaikan error parsing
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    window.localStorage.setItem(STORAGE_KEYS.visibility, JSON.stringify(columnVisibility));
  }, [columnVisibility, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (columnOrder.length === 0) return;
    window.localStorage.setItem(STORAGE_KEYS.order, JSON.stringify(columnOrder));
  }, [columnOrder, isMounted]);

  const markPending = useCallback((id: string, value: boolean) => {
    setPendingMap((prev) => {
      if (value) {
        if (prev[id]) return prev;
        return { ...prev, [id]: true };
      }
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const applyQuery = useCallback(
    (updates: Partial<ItemTableQuery>) => {
      const current = queryRef.current;
      const nextQuery: ItemTableQuery = {
        pageSize: updates.pageSize ?? current.pageSize,
        cursor: updates.cursor !== undefined ? updates.cursor ?? null : current.cursor ?? null,
        sort: updates.sort !== undefined ? updates.sort ?? null : current.sort ?? null,
        filters:
          updates.filters !== undefined ? updates.filters ?? null : current.filters ?? null,
        q: updates.q !== undefined ? updates.q ?? null : current.q ?? null,
        history:
          updates.history !== undefined ? updates.history ?? null : current.history ?? null,
      };

      const hasSameCursor = nextQuery.cursor === current.cursor;
      const hasSameSearch = (nextQuery.q ?? "") === (current.q ?? "");
      const sameFilters = areFiltersEqual(nextQuery.filters ?? null, current.filters ?? null);
      const sameSort = areSortsEqual(nextQuery.sort ?? null, current.sort ?? null);

      if (hasSameCursor && hasSameSearch && sameFilters && sameSort) {
        queryRef.current = nextQuery;
        return;
      }

      queryRef.current = nextQuery;

      const params = new URLSearchParams();
      params.set("pageSize", String(nextQuery.pageSize));

      if (nextQuery.cursor) {
        params.set("cursor", nextQuery.cursor);
      }

      if (nextQuery.sort && nextQuery.sort.length > 0) {
        params.set("sort", JSON.stringify(nextQuery.sort));
      }

      if (nextQuery.filters && nextQuery.filters.length > 0) {
        params.set("filters", JSON.stringify(nextQuery.filters));
      }

      if (nextQuery.q && nextQuery.q.trim() !== "") {
        params.set("q", nextQuery.q.trim());
      }

      if (nextQuery.history && nextQuery.history.length > 0) {
        params.set("history", JSON.stringify(nextQuery.history));
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router]
  );

  useEffect(() => {
    if (!isMounted) return;
    const normalizedFilter = (globalFilter ?? "").trim();
    const current = (queryRef.current.q ?? "").trim();
    if (normalizedFilter === current) return;

    const handle = window.setTimeout(() => {
      applyQuery({ q: normalizedFilter || null, cursor: null, history: null });
    }, 350);

    return () => window.clearTimeout(handle);
  }, [applyQuery, globalFilter, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const filtersParam = buildFiltersParam(filtersDraft);
    const current = queryRef.current.filters ?? null;
    if (areFiltersEqual(filtersParam, current)) return;

    setColumnFilters(toFiltersState(filtersParam));
    applyQuery({ filters: filtersParam, cursor: null, history: null });
  }, [applyQuery, filtersDraft, isMounted]);

  const handleSort = useCallback(
    (columnId: string) => {
      setSorting((prev) => {
        const current = prev.find((item) => item.id === columnId);
        let next: SortingState = [];

        if (!current) {
          next = [{ id: columnId, desc: false }];
        } else if (current.desc) {
          next = [];
        } else {
          next = [{ id: columnId, desc: true }];
        }

        applyQuery({ sort: serializeSortParam(next), cursor: null, history: null });
        return next;
      });
    },
    [applyQuery]
  );

  const handlePrev = useCallback(() => {
    const historyStack = queryRef.current.history ?? [];
    if (!historyStack || historyStack.length === 0) {
      applyQuery({ cursor: null, history: null });
      return;
    }

    const nextHistory = [...historyStack];
    const previousCursor = nextHistory.pop() ?? null;
    applyQuery({ cursor: previousCursor, history: nextHistory.length > 0 ? nextHistory : null });
  }, [applyQuery]);

  const handleNext = useCallback(() => {
    if (!initial.nextCursor) return;

    const currentHistory = queryRef.current.history ?? [];
    const nextHistory = [...currentHistory];

    if (queryRef.current.cursor) {
      nextHistory.push(queryRef.current.cursor);
    }

    applyQuery({ cursor: initial.nextCursor, history: nextHistory });
  }, [applyQuery, initial.nextCursor]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const handleInlineCommit = useCallback(
    async (
      id: string,
      patch: Partial<InventoryItem>,
      successMessage: string
    ): Promise<EditResult> => {
      const previous = cloneRows(dataRef.current);
      markPending(id, true);
      setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

      try {
        const result = await updateItem({ id, patch });
        if (!result.ok) {
          setData(previous);
          const message = result.error ?? "Gagal memperbarui data.";
          showToast(message, "error");
          return { ok: false, message };
        }

        showToast(successMessage, "success");
        startTransition(() => router.refresh());
        return { ok: true };
      } catch (error) {
        setData(previous);
        const message =
          error instanceof Error ? error.message : "Gagal memperbarui data.";
        showToast(message, "error");
        return { ok: false, message };
      } finally {
        markPending(id, false);
      }
    },
    [markPending, router, showToast, startTransition]
  );

  const handleDelete = useCallback(
    async (item: InventoryItem) => {
      const previous = cloneRows(dataRef.current);
      markPending(item.id, true);
      setData((prev) => prev.filter((row) => row.id !== item.id));

      try {
        const result = await deleteItem(item.id);
        if (!result.ok) {
          setData(previous);
          const message = result.error ?? "Gagal menghapus item.";
          showToast(message, "error");
          return;
        }

        showToast("Item berhasil dihapus.", "success");
        startTransition(() => router.refresh());
      } catch (error) {
        setData(previous);
        const message =
          error instanceof Error ? error.message : "Gagal menghapus item.";
        showToast(message, "error");
      } finally {
        markPending(item.id, false);
      }
    },
    [markPending, router, showToast, startTransition]
  );

  const handleModalSubmit = useCallback(
    async (id: string, payload: ModalPayload): Promise<EditResult> => {
      const previous = cloneRows(dataRef.current);
      markPending(id, true);
      setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...payload.optimistic } : row)));

      try {
        const result = await updateItem({ id, patch: payload.patch });
        if (!result.ok) {
          setData(previous);
          const message = result.error ?? "Gagal memperbarui data.";
          showToast(message, "error");
          return { ok: false, message };
        }

        showToast("Data inventori diperbarui.", "success");
        startTransition(() => router.refresh());
        setEditingId(null);
        return { ok: true };
      } catch (error) {
        setData(previous);
        const message = error instanceof Error ? error.message : "Gagal memperbarui data.";
        showToast(message, "error");
        return { ok: false, message };
      } finally {
        markPending(id, false);
      }
    },
    [markPending, router, showToast, startTransition]
  );

  const pendingForId = useCallback((id: string) => Boolean(pendingMap[id]), [pendingMap]);
  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Nama Barang",
        enableHiding: false,
        cell: ({ row }) => (
          <CellTextEditable
            value={row.original.name}
            label={`Nama barang ${row.original.name}`}
            disabled={pendingForId(row.original.id)}
            onCommit={(nextValue) =>
              handleInlineCommit(row.original.id, { name: nextValue }, "Nama barang diperbarui.")
            }
          />
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Kategori",
        cell: ({ row }) => row.original.category ?? "-",
      },
      {
        id: "brand",
        accessorKey: "brand",
        header: "Merk/Model",
        cell: ({ row }) => row.original.brand ?? "-",
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "Jumlah",
        cell: ({ row }) => (
          <CellNumberEditable
            value={row.original.quantity}
            label={`Jumlah untuk ${row.original.name}`}
            min={0}
            disabled={pendingForId(row.original.id)}
            onCommit={(nextValue) =>
              handleInlineCommit(row.original.id, { quantity: nextValue }, "Jumlah barang diperbarui.")
            }
          />
        ),
      },
      {
        id: "condition",
        accessorKey: "condition",
        header: "Kondisi",
        cell: ({ row }) => (
          <CellSelectEditable
            value={row.original.condition}
            label={`Kondisi ${row.original.name}`}
            options={CONDITION_OPTIONS}
            disabled={pendingForId(row.original.id)}
            onCommit={(nextValue) =>
              handleInlineCommit(row.original.id, { condition: nextValue as InventoryItem["condition"] }, "Kondisi barang diperbarui.")
            }
          />
        ),
      },
      {
        id: "qrPayload",
        accessorFn: (row) => row.qrPayload || row.barcodePayload || "-",
        header: "QR/Barcode",
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
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const isPendingRow = pendingForId(row.original.id);
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                aria-label={`Buka modal edit untuk ${row.original.name}`}
                className="rounded-full border border-transparent bg-[#EAF6EE] p-2 text-[#216B5B] transition hover:border-[#36AF30] hover:bg-[#D9F0E0] disabled:cursor-not-allowed disabled:text-[#A6C9B5]"
                onClick={() => setEditingId(row.original.id)}
                disabled={isPendingRow}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Hapus ${row.original.name}`}
                className="rounded-full border border-transparent bg-[#FCECEB] p-2 text-[#A83232] transition hover:border-[#E07070] hover:bg-[#F9D6D4] disabled:cursor-not-allowed disabled:text-[#D2A7A7]"
                onClick={() => handleDelete(row.original)}
                disabled={isPendingRow}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        },
      },
      {
        id: "images",
        accessorKey: "images",
        header: "Foto",
        cell: ({ row }) => row.original.images?.[0]?.url ?? "-",
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => row.original.description ?? "-",
      },
      {
        id: "unitPrice",
        accessorKey: "unitPrice",
        header: "Harga",
        cell: ({ row }) =>
          row.original.unitPrice != null ? currencyFormatter.format(row.original.unitPrice) : "-",
      },
      {
        id: "purchasedAt",
        accessorKey: "purchasedAt",
        header: "Tanggal Beli",
        cell: ({ row }) => row.original.purchasedAt ?? "-",
      },
      {
        id: "fundingSource",
        accessorKey: "fundingSource",
        header: "Sumber Dana",
        cell: ({ row }) => row.original.fundingSource ?? "-",
      },
      {
        id: "location",
        accessorKey: "location",
        header: "Lokasi",
        cell: ({ row }) => row.original.location ?? "-",
      },
      {
        id: "pic",
        accessorKey: "pic",
        header: "Penanggung Jawab",
        cell: ({ row }) => row.original.pic ?? "-",
      },
      {
        id: "lastCheckedAt",
        accessorKey: "lastCheckedAt",
        header: "Terakhir Cek",
        cell: ({ row }) => row.original.lastCheckedAt ?? "-",
      },
      {
        id: "floor",
        accessorKey: "floor",
        header: "Lantai",
        cell: ({ row }) => row.original.floor ?? "-",
      },
      {
        id: "room",
        accessorKey: "room",
        header: "Ruangan",
        cell: ({ row }) => row.original.room ?? "-",
      },
      {
        id: "rack",
        accessorKey: "rack",
        header: "Rak",
        cell: ({ row }) => row.original.rack ?? "-",
      },
    ],
    [currencyFormatter, handleDelete, handleInlineCommit, pendingForId]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableRows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 72,
    overscan: 8,
  });

  const useVirtual = tableRows.length > 1000;
  const virtualRows = useVirtual ? virtualizer.getVirtualItems() : [];
  const totalSize = useVirtual ? virtualizer.getTotalSize() : 0;
  const paddingTop = useVirtual && virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = useVirtual && virtualRows.length > 0
    ? totalSize - virtualRows[virtualRows.length - 1].end
    : 0;
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const hasPrevPage = Boolean(queryRef.current.cursor) || Boolean(queryRef.current.history?.length);
  const editingItem = editingId ? data.find((row) => row.id === editingId) ?? null : null;

  const resetPreferences = useCallback(() => {
    setColumnVisibility({ ...DEFAULT_VISIBILITY });
    setColumnOrder([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.visibility);
      window.localStorage.removeItem(STORAGE_KEYS.order);
    }
  }, []);
  return (
    <div className="space-y-6">
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <header className="flex flex-col gap-4 rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#216B5B]">Inventori Terdata</p>
          <h2 className="text-xl font-semibold text-[#2E6431]">Daftar Barang</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#CFE6D6] bg-[#EAF6EE] px-4 py-2 text-sm text-[#216B5B]">
          <Boxes className="h-4 w-4" aria-hidden="true" /> {data.length} item tercatat
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <div className="space-y-4 rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#216B5B]" aria-hidden="true" />
              <input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder="Cari nama, QR, atau kategori..."
                className="w-full rounded-full border border-[#CFE6D6] bg-[#EAF6EE] py-2 pl-10 pr-4 text-sm text-[#343B38] focus:border-[#36AF30] focus:outline-none"
                aria-label="Cari inventori"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[#3E4643]">
              <label className="flex items-center gap-2 rounded-full bg-[#EAF6EE] px-3 py-1">
                <span className="font-semibold text-[#216B5B]">Kategori</span>
                <input
                  value={filtersDraft.category}
                  onChange={(event) =>
                    setFiltersDraft((prev) => ({ ...prev, category: event.target.value }))
                  }
                  className="w-36 rounded-full border border-[#CFE6D6] bg-white px-3 py-1 text-[#343B38] focus:border-[#36AF30] focus:outline-none"
                  placeholder="contoh: Elektronik"
                />
              </label>
              <label className="flex items-center gap-2 rounded-full bg-[#EAF2FD] px-3 py-1">
                <span className="font-semibold text-[#185AB6]">Kondisi</span>
                <select
                  value={filtersDraft.condition}
                  onChange={(event) =>
                    setFiltersDraft((prev) => ({ ...prev, condition: event.target.value }))
                  }
                  className="rounded-full border border-[#CFE6D6] bg-white px-3 py-1 text-[#343B38] focus:border-[#36AF30] focus:outline-none"
                >
                  <option value="">Semua</option>
                  <option value="NEW">Baru</option>
                  <option value="GOOD">Baik</option>
                  <option value="DEFECT">Cacat</option>
                  <option value="BROKEN">Rusak</option>
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#3E4643]">
              <p>{isPending ? "Memuat data dari server..." : "Klik header untuk mengurutkan."}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF6EE] px-3 py-1 font-semibold text-[#216B5B]">
                  <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
                  Kolom aktif: {visibleColumnCount}
                </span>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="max-h-[70vh] overflow-auto rounded-2xl border border-[#E1F0E6]"
            >
              <table className="w-full min-w-[900px] border-separate border-spacing-0">
                <thead className="sticky top-0 z-20 bg-[#F1FBF4] text-left text-xs uppercase tracking-widest text-[#216B5B] shadow-sm">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        if (header.isPlaceholder) {
                          return <th key={header.id} />;
                        }

                        const isSortable = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        const ariaSort = (sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none") as "ascending" | "descending" | "none";
                        const stickyRight = header.column.id === "actions";

                        return (
                          <th
                            key={header.id}
                            scope="col"
                            aria-sort={ariaSort}
                            className={`whitespace-nowrap border-b border-[#CFE6D6] px-4 py-3 font-semibold ${
                              stickyRight ? "sticky right-0 z-30 bg-[#F1FBF4] shadow-[inset_1px_0_0_#CFE6D6]" : ""
                            }`}
                          >
                            {isSortable ? (
                              <button
                                type="button"
                                onClick={() => handleSort(header.column.id)}
                                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-left transition hover:bg-[#EAF6EE]"
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <span aria-hidden="true" className="text-[10px] font-bold">
                                  {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}
                                </span>
                              </button>
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="align-top text-sm text-[#343B38]">
                  {useVirtual && paddingTop > 0 ? (
                    <tr aria-hidden="true">
                      <td style={{ height: `${paddingTop}px` }} colSpan={visibleColumnCount} />
                    </tr>
                  ) : null}

                  {(useVirtual ? virtualRows : tableRows).map((rowLike) => {
                    const row = useVirtual
                      ? tableRows[(rowLike as VirtualItem).index]
                      : (rowLike as (typeof tableRows)[number]);
                    const key = row.id;
                    const style = useVirtual
                      ? { height: `${(rowLike as VirtualItem).size}px` }
                      : undefined;

                    return (
                      <tr
                        key={key}
                        style={style}
                        className="group border-b border-[#E7F4EB] bg-white transition hover:bg-[#F1FBF4]"
                      >
                        {row.getVisibleCells().map((cell) => {
                          const stickyRight = cell.column.id === "actions";
                          return (
                            <td
                              key={cell.id}
                              className={`h-full px-4 py-4 align-top ${
                                stickyRight
                                  ? "sticky right-0 z-10 bg-white/95 shadow-[inset_1px_0_0_#CFE6D6]"
                                  : ""
                              }`}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {useVirtual && paddingBottom > 0 ? (
                    <tr aria-hidden="true">
                      <td style={{ height: `${paddingBottom}px` }} colSpan={visibleColumnCount} />
                    </tr>
                  ) : null}

                  {tableRows.length === 0 && (
                    <tr>
                      <td colSpan={visibleColumnCount} className="px-4 py-10 text-center text-sm text-[#3E4643]">
                        Tidak ada data inventori yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-[#F4FBF6] px-4 py-3 text-xs text-[#216B5B] sm:flex-row">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasPrevPage}
                  className="rounded-full border border-[#216B5B] px-4 py-1 font-semibold transition disabled:cursor-not-allowed disabled:border-[#A6C9B5] disabled:text-[#A6C9B5] hover:bg-[#EAF6EE]"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!initial.nextCursor}
                  className="rounded-full border border-[#216B5B] px-4 py-1 font-semibold transition disabled:cursor-not-allowed disabled:border-[#A6C9B5] disabled:text-[#A6C9B5] hover:bg-[#EAF6EE]"
                >
                  Next
                </button>
              </div>
              <p>
                Cursor aktif: {queryRef.current.cursor ?? "awal"}
              </p>
            </div>
          </div>
        </div>

        <ColumnPreferences table={table} onReset={resetPreferences} />
      </section>

      {toast ? (
        <div
          role="status"
          aria-live="assertive"
          className={`fixed bottom-6 right-6 z-50 min-w-[240px] max-w-sm rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.tone === "success"
              ? "bg-[#EAF6EE] text-[#216B5B] border border-[#CFE6D6]"
              : "bg-[#FCECEB] text-[#A83232] border border-[#F3C5C3]"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {editingItem ? (
        <ModalEdit
          open
          item={editingItem}
          pending={pendingForId(editingItem.id)}
          onClose={() => setEditingId(null)}
          onSubmit={(patch) => handleModalSubmit(editingItem.id, patch)}
        />
      ) : null}
    </div>
  );
}
