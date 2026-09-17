/**
 * Shared pagination bounds — single source of truth for DAL page helpers
 * (academy, events, artists). `to` is INCLUSIVE so bounds feed Supabase
 * `.range(from, to)` directly and arrays via `.slice(from, to + 1)`.
 */

export const PAGE_SIZE = 9;

export interface PageBounds {
  page: number;
  perPage: number;
  totalPages: number;
  from: number;
  to: number;
}

export function pagination(total: number, page = 1, perPage: number = PAGE_SIZE): PageBounds {
  const safeTotal = Math.max(0, Math.floor(total || 0));
  const safePer = Math.max(1, Math.floor(perPage || PAGE_SIZE));
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePer));
  const safePage = Math.min(Math.max(1, Math.floor(page || 1)), totalPages);
  const from = (safePage - 1) * safePer;
  const to = Math.min(from + safePer - 1, Math.max(0, safeTotal - 1));
  return { page: safePage, perPage: safePer, totalPages, from, to };
}
