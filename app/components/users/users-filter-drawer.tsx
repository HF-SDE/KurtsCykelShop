import { Combobox } from "@components/combobox";
import { RolesFilterDrawerBase } from "@components/roles/roles-filter-drawer-base";
import { useFilterDrawerState } from "@components/roles/use-filter-drawer-state";
import { VStack } from "@components/ui/vstack";

export type UserFiltersType = {
  isActive?: boolean;
};

interface UsersFilterDrawerProps {
  showDrawer: boolean;
  setShowDrawer: (value: boolean) => void;
  filters: UserFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<UserFiltersType>>;
}

const accountStatusOptions = [
  { id: "active", name: "Aktive" },
  { id: "archived", name: "Arkiverede" },
  { id: "all", name: "Alle" },
];

export function UsersFilterDrawer({ showDrawer, setShowDrawer, filters, setFilters }: UsersFilterDrawerProps) {
  const { localFilters, handleReset, handleApply, handleClose, handleChange } = useFilterDrawerState({
    showDrawer,
    setShowDrawer,
    filters,
    setFilters,
  });

  const selectedStatus =
    localFilters.isActive === true ? "active" : localFilters.isActive === false ? "archived" : "all";

  return (
    <RolesFilterDrawerBase showDrawer={showDrawer} onClose={handleClose} onReset={handleReset} onApply={handleApply}>
      <VStack space="xl" className="py-4">
        <Combobox
          label="Kontostatus"
          options={accountStatusOptions}
          value={selectedStatus}
          onChange={(value) =>
            handleChange("isActive", value === "active" ? true : value === "archived" ? false : undefined)
          }
        />
      </VStack>
    </RolesFilterDrawerBase>
  );
}
