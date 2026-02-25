import { createContext, useContext } from "react";

import { Role } from "@/types/users/Role";

import { useData } from "@hooks/useData";

export const RoleContext = createContext<{data: Role[], setData: (data: Role[]) => void, isLoading: boolean}>({data: [], setData: () => {}, isLoading: false});

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a <RoleProvider />");
  }

  return context;
}

export default function RoleProvider({ children }: { children: React.ReactNode }) {
  const [data, setData, isLoading] = useData<Role>("/roles");

  return <RoleContext.Provider value={{data, setData, isLoading}}>{children}</RoleContext.Provider>;
}
