import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useSession } from "@/app/ctx";
import { type Permission } from "@permission-types";

interface PermissionsContextValue {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: readonly Permission[]) => boolean;
  hasAllPermissions: (permissions: readonly Permission[]) => boolean;
  hasPageAccess: (page: string) => boolean;
  getAccessiblePages: () => string[];
  isLoading: boolean;
}

export const PermissionContext = createContext<PermissionsContextValue | undefined>(undefined);

export function UsePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("UsePermissions must be used within a <PermissionsProvider />");
  }

  return context;
}

export default function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading: isSessionLoading } = useSession();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (isSessionLoading) {
      setIsLoading(true);
      return () => {
        isMounted = false;
      };
    }

    if (!session) {
      setPermissions([]);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const decoded = decodeJwt(session);
    const nextPermissions = decoded && Array.isArray(decoded.permissions) ? (decoded.permissions as Permission[]) : [];

    if (isMounted) {
      setPermissions(nextPermissions);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [session, isSessionLoading]);

  const permissionSet = useMemo(() => new Set<Permission>(permissions), [permissions]);

  const accessiblePages = useMemo(() => {
    const pageSet = new Set<string>(["ProfilePage"]);

    permissions.forEach((permission) => {
      permissionsToPages[permission]?.forEach((page) => {
        pageSet.add(page);
      });
    });

    return Array.from(pageSet);
  }, [permissions]);

  const accessiblePageSet = useMemo(() => new Set(accessiblePages), [accessiblePages]);

  const hasPermission = useCallback((permission: Permission) => permissionSet.has(permission), [permissionSet]);

  const hasAnyPermission = useCallback(
    (perms: readonly Permission[]) => perms.some((permission) => permissionSet.has(permission)),
    [permissionSet],
  );

  const hasAllPermissions = useCallback(
    (perms: readonly Permission[]) => perms.every((permission) => permissionSet.has(permission)),
    [permissionSet],
  );

  const hasPageAccess = useCallback((page: string) => accessiblePageSet.has(page), [accessiblePageSet]);

  const getAccessiblePages = useCallback(() => [...accessiblePages], [accessiblePages]);

  const contextValue = useMemo<PermissionsContextValue>(
    () => ({
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasPageAccess,
      getAccessiblePages,
      isLoading,
    }),
    [permissions, hasPermission, hasAnyPermission, hasAllPermissions, hasPageAccess, getAccessiblePages, isLoading],
  );

  return <PermissionContext.Provider value={contextValue}>{children}</PermissionContext.Provider>;
}

function decodeJwt(token: string): { permissions?: unknown } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decodedPayload = atob(padded);
    return JSON.parse(decodedPayload) as { permissions?: unknown };
  } catch {
    return null;
  }
}

const permissionsToPages: Record<Permission, string[]> = {
  "administrator:users:view": ["ManagementPage", "UsersPage"],
  "administrator:users:update": ["ManagementPage", "UsersPage"],
  "administrator:users:create": ["ManagementPage", "UsersPage"],
  "administrator:users:management": ["ManagementPage", "UsersPage"],
  "administrator:permission:create": ["ManagementPage", "PermissionPage"],
  "administrator:permission:view": ["ManagementPage", "PermissionPage"],
  "administrator:permissiongroup:create": ["ManagementPage", "PermissionGroupPage"],
  "administrator:role:view": ["ManagementPage", "RolesPage"],
  "administrator:role:update": ["ManagementPage", "RolesPage"],
  "administrator:role:create": ["ManagementPage", "RolesPage"],
  "storage:item:view": ["StockPage"],
  "storage:item:create": ["StockPage"],
  "storage:item:update": ["StockPage"],
  "storage:item:delete": ["StockPage"],
  "storage:vendor:view": ["StockPage"],
  "storage:vendor:create": ["StockPage"],
  "storage:vendor:update": ["StockPage"],
  "storage:vendor:delete": ["StockPage"],
  "storage:location:view": ["StockPage"],
  "storage:location:create": ["StockPage"],
  "storage:location:update": ["StockPage"],
  "storage:location:delete": ["StockPage"],
  "storage:unit:view": ["StockPage"],
  "storage:unit:create": ["StockPage"],
  "storage:unit:update": ["StockPage"],
  "storage:unit:delete": ["StockPage"],
  "case:view": ["CasePage"],
  "case:update": ["CasePage"],
  "case:create": ["CasePage"],
  "case:delete": ["CasePage"],
  "case:assign": ["CasePage"],
  "case:update:items": ["CasePage"],
};
