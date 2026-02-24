import { createContext, useContext } from "react";

import { Item } from "@/types/Inventory/Item";

import { UsePaginatedDataResult, usePaginatedData } from "@hooks/usePaginatedData";

export const StorageContext = createContext<UsePaginatedDataResult<Item>>({} as UsePaginatedDataResult<Item>);

export function useStorage() {
  const context = useContext(StorageContext);

  if (!context) {
    throw new Error("useStorageContext must be used within a <StorageProvider />");
  }

  return context;
}

export default function StorageProvider({ children }: { children: React.ReactNode }) {
  const paginatedData = usePaginatedData<Item>("/items/paginated");

  return <StorageContext.Provider value={paginatedData}>{children}</StorageContext.Provider>;
}
