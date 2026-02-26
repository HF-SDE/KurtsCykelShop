import { useCallback, useEffect, useRef, useState } from "react";

import apiClient from "@/utils/apiClient";

import { ItemFiltersType } from "@schemas/item.schemas";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface UsePaginatedDataResult<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  filters: ItemFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<ItemFiltersType>>;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export interface UsePaginatedDataOptions {
  limit?: number;
  searchParam?: string;
  initialSearch?: string;
  searchDebounceMs?: number;
}

export function usePaginatedData<T>(url: string, options: UsePaginatedDataOptions = {}): UsePaginatedDataResult<T> {
  const { limit = 20, searchParam = "search", searchDebounceMs = 300 } = options;

  const [data, setData] = useState<T[]>([]);
  const [search, setSearch] = useState(options.initialSearch ?? "");
  const [filters, setFilters] = useState<ItemFiltersType>({});
  const [debouncedSearch, setDebouncedSearch] = useState(options.initialSearch ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPage = useRef(1);
  const latestRequestId = useRef(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, searchDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [search, searchDebounceMs]);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const requestId = ++latestRequestId.current;
      const trimmedSearch = debouncedSearch.trim();
      const params: Record<string, string | number> = { page, limit };
      if (trimmedSearch.length > 0) params[searchParam] = trimmedSearch;
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params[key] = String(value);
        }
      });

      const response = await apiClient.get<{ data: PaginatedResponse<T> }>(url, { params });

      if (requestId !== latestRequestId.current) return;

      const { data: items, hasMore: more } = response.data.data;

      setData((prev) => (append ? [...prev, ...items] : items));
      setHasMore(more);
      currentPage.current = page;
    },
    [debouncedSearch, limit, searchParam, url, filters],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchPage(1, false);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchPage(1, false);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      await fetchPage(currentPage.current + 1, true);
    } catch (err) {
      console.error("Error loading more data:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, hasMore, isLoadingMore]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    setData,
    search,
    setSearch,
    filters,
    setFilters,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    refresh,
    loadMore,
  };
}
