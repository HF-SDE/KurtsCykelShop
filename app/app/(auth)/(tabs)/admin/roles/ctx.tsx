import { createContext, useContext } from "react";

import { Role } from "@/types/users/Role";

import { UsePaginatedDataResult, usePaginatedData } from "@hooks/usePaginatedData";

export const RoleContext = createContext<UsePaginatedDataResult<Role>>({} as UsePaginatedDataResult<Role>);

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a <RoleProvider />");
  }

  return context;
}

export default function RoleProvider({ children }: { children: React.ReactNode }) {
  const paginatedData = usePaginatedData<Role>("/roles/paginated");

  return <RoleContext.Provider value={paginatedData}>{children}</RoleContext.Provider>;
}
