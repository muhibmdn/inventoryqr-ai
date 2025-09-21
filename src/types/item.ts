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
  qrImage?: string | null;
  barcodePayload?: string | null;
  barcodeImage?: string | null;
  code?: string | null;
  images?: { id: string; url: string }[];
};

export type ItemInput = Omit<Item, "id">;

export type ApiResult<T> = {
  data: T;
  error: string | null;
  meta?: Record<string, unknown>;
};

export type ItemTableSort = {
  id: string;
  desc?: boolean | null;
};

export type ItemTableFilter = {
  id: string;
  value: unknown;
};

export type ItemTableQuery = {
  cursor?: string | null;
  pageSize: number;
  sort?: ItemTableSort[] | null;
  filters?: ItemTableFilter[] | null;
  q?: string | null;
  history?: (string | null)[] | null;
};

export type PageResult<T> = {
  rows: T[];
  nextCursor: string | null;
  error: string | null;
};


