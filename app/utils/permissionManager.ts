import { getStorageItemAsync } from "@hooks/useStorageState";
import { type Permission } from "@permission-types";

// utils/PermissionManager.ts
export class PermissionManager {
  private permissions: Permission[] = [];
  private pages: string[] = [];

  // Map of permissions to multiple pages
  private permissionsToPages: Record<Permission, string[]> = {
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

  // Helper function to decode the JWT token
  private decodeJwt(token: string): any {
    const payload = token.split(".")[1]; // Get the payload part (second part of the JWT)
    const decodedPayload = atob(payload); // Decode base64 URL encoded string
    return JSON.parse(decodedPayload); // Parse the decoded JSON string
  }

  // Async method to get permissions
  private async getPermissions(): Promise<Permission[]> {
    const token: string | null = await getStorageItemAsync("token");

    if (!token) {
      return []; // If no token is available, return an empty array
    }

    // Decode the token and extract permissions
    const decoded = this.decodeJwt(token);
    return (decoded.permissions || []) as Permission[]; // Return permissions or an empty array if not found
  }

  // Initialize method to load permissions asynchronously
  public async init(): Promise<void> {
    this.permissions = await this.getPermissions();
    this.pages = await this.getAccessiblePages();
  }

  // Method to check if the user has a particular permission
  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }

  // Method to check if the user has at least one of the permissions from a list
  hasAnyPermission(permissions: readonly Permission[]): boolean {
    return permissions.some((permission) => this.permissions.includes(permission));
  }

  // Method to check if the user has all of the permissions from a list
  hasAllPermissions(permissions: readonly Permission[]): boolean {
    return permissions.every((permission) => this.permissions.includes(permission));
  }

  // Method to check if the user has access to a specific page
  hasPageAccess(page: string): boolean {
    return this.pages.includes(page);
  }

  // Method to get the list of pages the user can access
  public getAccessiblePages(): string[] {
    // Loop through the permissions and collect all pages the user has access to
    let accessiblePages: string[] = ["ProfilePage"];
    (Object.keys(this.permissionsToPages) as Permission[]).forEach((permission) => {
      if (this.permissions.includes(permission)) {
        // Add all pages associated with this permission
        accessiblePages = [...accessiblePages, ...this.permissionsToPages[permission]];
      }
    });

    // Remove duplicates (in case a user has multiple permissions for the same page)
    return [...new Set(accessiblePages)];
  }
}

// Example usage: Initialize with a list of permissions
export const permissionManager = new PermissionManager();

// To initialize the permissions asynchronously
async function initializePermissions() {
  await permissionManager.init();
}
