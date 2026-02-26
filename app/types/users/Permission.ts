export interface Permission {
  id: string;
  code: string;
  description?: string;
  permissionGroupId: string;
  createdAt: string;
  updatedAt: string;
  isAssigned?: boolean;
  permissionGroup?: {
    id: string;
    name: string;
  };
}
