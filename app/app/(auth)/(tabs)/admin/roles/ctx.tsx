import { createContext, useContext } from "react";

import { Permission } from "@/types/users/Permission";
import { Role } from "@/types/users/Role";

import { useData } from "@hooks/useData";

export const RoleContext = createContext<{ data: Role[]; setData: (data: Role[]) => void; isLoading: boolean }>({
  data: [],
  setData: () => {},
  isLoading: false,
});

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a <RoleProvider />");
  }

  return context;
}

export default function RoleProvider({ children }: { children: React.ReactNode }) {
  const [data, setData, isLoading] = useData<Role>("/manage/role");

  return <RoleContext.Provider value={{ data, setData, isLoading }}>{children}</RoleContext.Provider>;
}

type RoleWithPermissions = Role & {
  permissions?: Permission[];
};

export const RolePermissionContext = createContext<{
  data: RoleWithPermissions | null;
  setData: (data: RoleWithPermissions | null) => void;
  isLoading: boolean;
}>({ data: null, setData: () => {}, isLoading: false });

export function useRolePermissions() {
  const context = useContext(RolePermissionContext);

  if (!context) {
    throw new Error("useRolePermissions must be used within a <RolePermissionProvider />");
  }

  return context;
}

export function RolePermissionProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const [roleData, setRoleData, isLoading] = useData<RoleWithPermissions>(
    `/manage/role/${id}?withPermissions=true&withAllPermissions=true`,
    [],
    {
      select: (raw) => {
        if (!raw) return [];

        return [raw as RoleWithPermissions];
      },
    },
  );

  const data = roleData[0] || null;

  const setData = (nextRole: RoleWithPermissions | null) => {
    setRoleData(nextRole ? [nextRole] : []);
  };

  return (
    <RolePermissionContext.Provider value={{ data, setData, isLoading }}>{children}</RolePermissionContext.Provider>
  );
}
