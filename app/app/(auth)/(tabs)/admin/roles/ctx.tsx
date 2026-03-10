import { createContext, useContext } from "react";

import { Role } from "@/types/users/Role";

import { useData } from "@hooks/useData";

interface RoleContextValue {
  data: Role[];
  setData: (data: Role[]) => void;
  isLoading: boolean;
}

export const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a <RoleProvider />");
  }

  return context;
}

export default function RoleProvider({ children }: { children: React.ReactNode }) {
  const [data, setData, isLoading] = useData<Role>(
    "/manage/role?withPermissions=true&withAllPermissions=true&withPermissionGroups=true",
    [],
  );

  return <RoleContext.Provider value={{ data, setData, isLoading }}>{children}</RoleContext.Provider>;
}
