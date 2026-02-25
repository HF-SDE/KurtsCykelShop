import { useCallback, useEffect, useState } from "react";

import apiClient from "@/utils/apiClient";

type SetData<T> = React.Dispatch<React.SetStateAction<T[]>>;

type UseDataOptions = {
  useCache?: boolean;
  cacheTimeMs?: number;
  select?: (data: unknown) => unknown[];
};

type CacheEntry = {
  data: unknown[];
  timestamp: number;
};

const dataCache = new Map<string, CacheEntry>();

const DEFAULT_CACHE_TIME_MS = 5 * 60 * 1000;

export function useData<T>(
  url: string,
  defaultData: T[] = [],
  options: UseDataOptions = {},
): [T[], SetData<T>, boolean, () => void] {
  const { useCache = true, cacheTimeMs = DEFAULT_CACHE_TIME_MS, select } = options;
  const [data, setData] = useState<T[]>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(
    async (forceRefresh = false) => {
      if (useCache && !forceRefresh) {
        const cached = dataCache.get(url);
        const isCacheValid = cached && Date.now() - cached.timestamp < cacheTimeMs;

        if (isCacheValid) {
          setData(cached.data as T[]);
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await apiClient.get(url);

        const rawData = response.data.data;
        const fetchedData = (select ? select(rawData) : rawData) as T[];
        setData(fetchedData);

        if (useCache) {
          dataCache.set(url, { data: fetchedData, timestamp: Date.now() });
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [cacheTimeMs, select, url, useCache],
  );

  const refresh = useCallback(() => {
    setIsLoading(true);
    getData(true);
  }, [getData]);

  useEffect(() => {
    getData();
  }, [getData]);

  return [data, setData, isLoading, refresh];
}
