import { useCallback, useEffect, useRef, useState } from "react";

import apiClient from "@/utils/apiClient";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface UsePaginatedDataResult<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function usePaginatedData<T>(url: string, limit: number = 20): UsePaginatedDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPage = useRef(1);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const response = await apiClient.get<{ data: PaginatedResponse<T> }>(url, {
        params: { page, limit },
      });

      const { data: items, hasMore: more } = response.data.data;

      setData((prev) => (append ? [...prev, ...items] : items));
      setHasMore(more);
      currentPage.current = page;
    },
    [url, limit],
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

  return { data, setData, isLoading, isRefreshing, isLoadingMore, hasMore, refresh, loadMore };
}
