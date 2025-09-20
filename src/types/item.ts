export type ItemCondition = "NEW" | "GOOD" | "DEFECT" | "BROKEN";

export type Item = {
  id: string;
  name: string;
  sku?: string | null;
  brand?: string | null;
  description?: string | null;
  category?: string | null;
  quantity: number;
  unitPrice?: number | null;
  purchasedAt?: string | null;
  fundingSource?: string | null;
  location?: string | null;
  floor?: string | null;
  room?: string | null;
  rack?: string | null;
  condition: ItemCondition;
  damagedAt?: string | null;
  pic?: string | null;
  lastCheckedAt?: string | null;
  qrPayload?: string | null;
  barcodePayload?: string | null;
  code?: string | null;
};

export type ItemInput = Omit<Item, "id">;

export type ApiResult<T> = {
  data: T;
  error: string | null;
  meta?: Record<string, unknown>;
};