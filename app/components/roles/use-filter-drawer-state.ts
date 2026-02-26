import { Dispatch, SetStateAction, useEffect, useState } from "react";

type SetState<T> = Dispatch<SetStateAction<T>>;

interface UseFilterDrawerStateProps<T extends Record<string, unknown>> {
  showDrawer: boolean;
  setShowDrawer: (value: boolean) => void;
  filters: T;
  setFilters: SetState<T>;
}

export function useFilterDrawerState<T extends Record<string, unknown>>({
  showDrawer,
  setShowDrawer,
  filters,
  setFilters,
}: UseFilterDrawerStateProps<T>) {
  const [localFilters, setLocalFilters] = useState<T>(filters);

  useEffect(() => {
    if (showDrawer) {
      setLocalFilters(filters);
    }
  }, [showDrawer, filters]);

  function handleChange<K extends keyof T>(key: K, value: T[K]) {
    setLocalFilters((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  function handleReset() {
    setLocalFilters({} as T);
  }

  function handleApply() {
    setFilters(localFilters);
    setShowDrawer(false);
  }

  function handleClose() {
    setLocalFilters(filters);
    setShowDrawer(false);
  }

  return {
    localFilters,
    handleChange,
    handleReset,
    handleApply,
    handleClose,
  };
}
