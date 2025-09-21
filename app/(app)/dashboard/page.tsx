import { Suspense } from "react";

import { db } from "@/db";
import { Condition } from "@prisma/client";

import { DashboardHomeSkeleton } from "./_components/DashboardHomeSkeleton";

const conditionLabel: Record<Condition, string> = {
  NEW: "Baru",
  GOOD: "Baik",
  DEFECT: "Cacat",
  BROKEN: "Rusak",
};

async function getDashboardSummary() {
  try {
    const [totalItems, quantityAggregate, categoryGroups, conditionGroups, recentItems, pricedItems] =
      await Promise.all([
        db.item.count(),
        db.item.aggregate({ _sum: { quantity: true } }),
        db.item.groupBy({ by: ["category"], _count: { _all: true } }),
        db.item.groupBy({ by: ["condition"], _count: { _all: true } }),
        db.item.findMany({
          select: {
            id: true,
            name: true,
            category: true,
            quantity: true,
            condition: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        db.item.findMany({ select: { quantity: true, unitPrice: true } }),
      ]);

    const uniqueCategories = categoryGroups.filter((c) => c.category).length;
    const totalQuantity = quantityAggregate._sum.quantity ?? 0;
    const estimatedValue = pricedItems.reduce((total, item) => {
      if (!item.unitPrice) return total;
      return total + Number(item.unitPrice) * item.quantity;
    }, 0);

    const conditionBreakdown = conditionGroups.map((group) => ({
      condition: group.condition,
      count: group._count._all,
    }));

    return {
      totalItems,
      totalQuantity,
      uniqueCategories,
      estimatedValue,
      conditionBreakdown,
      recentItems,
    } as const;
  } catch (error) {
    console.error("Failed to load dashboard summary", error);
    return {
      totalItems: 0,
      totalQuantity: 0,
      uniqueCategories: 0,
      estimatedValue: 0,
      conditionBreakdown: [],
      recentItems: [],
    } as const;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

async function DashboardSummaryContent() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#216B5B]">Total Item</p>
          <p className="mt-3 text-3xl font-semibold text-[#2E6431]">{summary.totalItems}</p>
          <p className="mt-2 text-xs text-[#3E4643]">Jumlah SKU yang tercatat di sistem</p>
        </article>
        <article className="rounded-3xl border border-[#C7D9F7] bg-[#EAF2FD] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#185AB6]">Total Unit</p>
          <p className="mt-3 text-3xl font-semibold text-[#185AB6]">{summary.totalQuantity}</p>
          <p className="mt-2 text-xs text-[#3E4643]">Akumulasi seluruh stok barang</p>
        </article>
        <article className="rounded-3xl border border-[#FFE3B3] bg-[#FFF7E6] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B97C00]">Kategori Aktif</p>
          <p className="mt-3 text-3xl font-semibold text-[#B97C00]">{summary.uniqueCategories}</p>
          <p className="mt-2 text-xs text-[#3E4643]">Kategori barang yang terisi</p>
        </article>
        <article className="rounded-3xl border border-[#F6B8B8] bg-[#F6B8B8]/20 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#A83232]">Nilai Inventori</p>
          <p className="mt-3 text-3xl font-semibold text-[#A83232]">{formatCurrency(summary.estimatedValue)}</p>
          <p className="mt-2 text-xs text-[#3E4643]">Estimasi berdasarkan jumlah dan harga satuan</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-3xl border border-[#CFE6D6] bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#216B5B]">Performa Kondisi Barang</h2>
              <p className="text-xs text-[#3E4643]">Lihat distribusi kondisi untuk menjaga kualitas aset.</p>
            </div>
          </header>
          <div className="mt-6 space-y-4">
            {summary.conditionBreakdown.length === 0 && (
              <p className="rounded-2xl bg-[#EAF6EE] px-4 py-3 text-sm text-[#3E4643]">
                Belum ada data kondisi barang yang tercatat.
              </p>
            )}
            {summary.conditionBreakdown.map((item) => {
              const total = summary.conditionBreakdown.reduce((acc, curr) => acc + curr.count, 0) || 1;
              const percentage = Math.round((item.count / total) * 100);
              const palette = {
                NEW: "bg-[#36AF30]",
                GOOD: "bg-[#216B5B]",
                DEFECT: "bg-[#FFB114]",
                BROKEN: "bg-[#A83232]",
              } as const;
              return (
                <div key={item.condition} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-[#343B38]">
                    <span>{conditionLabel[item.condition]}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#EAF6EE]">
                    <div
                      className={`h-full rounded-full ${palette[item.condition]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
        <article className="rounded-3xl border border-[#C7D9F7] bg-[#EAF2FD] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#185AB6]">Aktivitas Terbaru</h2>
          <p className="text-xs text-[#3E4643]">Pantau item yang baru saja ditambahkan.</p>
          <ul className="mt-4 space-y-3">
            {summary.recentItems.length === 0 && (
              <li className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-[#3E4643]">
                Belum ada aktivitas terbaru.
              </li>
            )}
            {summary.recentItems.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-[#343B38]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#216B5B]">{item.name}</p>
                    <p className="text-xs text-[#3E4643]">
                      {item.category ?? "Kategori belum ditentukan"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[#3E4643]">
                    <p>{formatDate(item.createdAt)}</p>
                    <p>{item.quantity} unit • {conditionLabel[item.condition]}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <Suspense fallback={<DashboardHomeSkeleton />}>
      <DashboardSummaryContent />
    </Suspense>
  );
}
