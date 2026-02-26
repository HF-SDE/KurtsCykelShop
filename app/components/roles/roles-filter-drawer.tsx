import { Permission } from "@/types/users/Permission";

import { Combobox } from "@components/combobox";
import { VStack } from "@components/ui/vstack";
import { useData } from "@hooks/useData";

import { RolesFilterDrawerBase } from "./roles-filter-drawer-base";
import { useFilterDrawerState } from "./use-filter-drawer-state";

export type RolePermissionFiltersType = {
  permissionId?: string;
};

interface RolesFilterDrawerProps {
  showDrawer: boolean;
  setShowDrawer: (value: boolean) => void;
  filters: RolePermissionFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<RolePermissionFiltersType>>;
}
export function RolesFilterDrawer({ showDrawer, setShowDrawer, filters, setFilters }: RolesFilterDrawerProps) {
  const [permissions] = useData<Permission>("/manage/permission");
  const { localFilters, handleChange, handleReset, handleApply, handleClose } = useFilterDrawerState({
    showDrawer,
    setShowDrawer,
    filters,
    setFilters,
  });

  return (
    <RolesFilterDrawerBase showDrawer={showDrawer} onClose={handleClose} onReset={handleReset} onApply={handleApply}>
      <VStack space="xl" className="py-4">
        <Combobox
          label="Rettighed"
          options={permissions.map((permission) => ({ id: permission.id, name: permission.code }))}
          value={localFilters.permissionId}
          onChange={(value) => handleChange("permissionId", value)}
        />
      </VStack>
    </RolesFilterDrawerBase>
  );
}
