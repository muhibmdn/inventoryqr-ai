import "server-only";

import { appConfig } from "@/src/app-config";

import type { CacheTag } from "./cache-tags";

export class FetcherError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly info?: unknown
  ) {
    super(message);
    this.name = "FetcherError";
  }
}

type NextFetchRequestConfig = NonNullable<RequestInit["next"]>;

type ApiFetchInit = Omit<RequestInit, "next"> & {
  revalidate?: number;
  tags?: CacheTag[];
  next?: NextFetchRequestConfig;
  parse?: "json" | "text" | "arrayBuffer";
};

const buildUrl = (input: string | URL): string => {
  if (input instanceof URL) return input.toString();
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  return new URL(input, appConfig.urls.base).toString();
};

const normalizeTags = (tags: CacheTag[] = [], next?: NextFetchRequestConfig) => {
  const set = new Set<CacheTag>();
  if (next?.tags) {
    for (const tag of next.tags) {
      set.add(tag as CacheTag);
    }
  }
  for (const tag of tags) {
    set.add(tag);
  }
  return Array.from(set);
};

const parseErrorBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.clone().json();
  } catch {
    try {
      const text = await response.clone().text();
      return text.trim() === "" ? undefined : text;
    } catch {
      return undefined;
    }
  }
};

const deriveErrorMessage = (info: unknown, fallback: string) => {
  if (typeof info === "string" && info.trim() !== "") {
    return info.trim();
  }

  if (info && typeof info === "object") {
    const record = info as Record<string, unknown>;
    const possibleError = record.error;

    if (typeof possibleError === "string" && possibleError.trim() !== "") {
      return possibleError.trim();
    }

    if (possibleError && typeof possibleError === "object") {
      const nested = possibleError as Record<string, unknown>;
      const nestedMessage = nested.message;
      if (typeof nestedMessage === "string" && nestedMessage.trim() !== "") {
        return nestedMessage.trim();
      }
    }

    const directMessage = record.message;
    if (typeof directMessage === "string" && directMessage.trim() !== "") {
      return directMessage.trim();
    }

    const issues =
      (record as { issues?: unknown }).issues ??
      (record as { errors?: unknown }).errors;
    if (Array.isArray(issues) && issues.length > 0) {
      const firstIssue = issues[0];
      if (typeof firstIssue === "string" && firstIssue.trim() !== "") {
        return firstIssue.trim();
      }
    }

    const metaRaw = (record as { meta?: unknown }).meta;
    if (metaRaw && typeof metaRaw === "object") {
      const metaRecord = metaRaw as Record<string, unknown>;
      const metaIssues = metaRecord.issues;
      if (Array.isArray(metaIssues) && metaIssues.length > 0) {
        const firstMetaIssue = metaIssues[0];
        if (typeof firstMetaIssue === "string" && firstMetaIssue.trim() !== "") {
          return firstMetaIssue.trim();
        }
      }
    }
  }

  return fallback;
};

export async function apiFetch<TResponse = unknown>(
  input: string | URL,
  init: ApiFetchInit = {}
): Promise<TResponse> {
  const {
    revalidate,
    tags,
    headers,
    cache: cacheStrategy,
    credentials = "include",
    parse = "json",
    next,
    ...rest
  } = init;

  const url = buildUrl(input);
  const nextConfig: NextFetchRequestConfig = {
    revalidate: revalidate ?? next?.revalidate ?? appConfig.cache.defaultRevalidate,
    tags: normalizeTags(tags, next),
  };

  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    cache: cacheStrategy,
    credentials,
    next: nextConfig,
  });

  if (!response.ok) {
    const info = await parseErrorBody(response);
    const message = deriveErrorMessage(
      info,
      `Request to ${url} failed with status ${response.status}`
    );
    throw new FetcherError(message, response.status, info);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  if (parse === "text") {
    return (await response.text()) as TResponse;
  }

  if (parse === "arrayBuffer") {
    return (await response.arrayBuffer()) as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const fetcher = apiFetch;

export function withRevalidate<TResponse = unknown>(
  input: string | URL,
  init: ApiFetchInit & { revalidate: number }
) {
  return apiFetch<TResponse>(input, init);
}

export function withNoStore<TResponse = unknown>(
  input: string | URL,
  init: ApiFetchInit = {}
) {
  return apiFetch<TResponse>(input, { ...init, cache: "no-store", revalidate: 0 });
}