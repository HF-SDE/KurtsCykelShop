export interface InventoryTransaction {
  id: string;
  itemId: string;
  locationId: string;
  type: string;
  quantityChange: number;
  unitId: string;
  referenceTypeId: string;
  referenceId: string;
  performedById: string;
  performedByName: string;
  createdAt: string;
  updatedAt: string;
}
