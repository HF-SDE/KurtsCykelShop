import { PermissionGroup } from "@/types/users/PermissionGroup";

import { Combobox } from "@components/combobox";
import { VStack } from "@components/ui/vstack";
import { useData } from "@hooks/useData";

import { RolesFilterDrawerBase } from "./roles-filter-drawer-base";
import { useFilterDrawerState } from "./use-filter-drawer-state";

export type RolePermissionGroupFiltersType = {
  permissionGroupId?: string;
};

interface RolesPermissionGroupFilterDrawerProps {
  showDrawer: boolean;
  setShowDrawer: (value: boolean) => void;
  filters: RolePermissionGroupFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<RolePermissionGroupFiltersType>>;
}

export function RolesPermissionGroupFilterDrawer({
  showDrawer,
  setShowDrawer,
  filters,
  setFilters,
}: RolesPermissionGroupFilterDrawerProps) {
  const [permissionGroups] = useData<PermissionGroup>("/manage/permissionGroups");
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
          label="Rettighedsgruppe"
          options={permissionGroups}
          value={localFilters.permissionGroupId}
          onChange={(value) => handleChange("permissionGroupId", value)}
        />
      </VStack>
    </RolesFilterDrawerBase>
  );
}
