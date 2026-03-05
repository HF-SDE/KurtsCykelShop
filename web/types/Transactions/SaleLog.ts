export interface SaleLog {
  id: string;
  itemId: string;
  salePricePerUnit: number;
  originalPricePerUnit: number;
  quantity: number;
  unitId: string;
  soldById: string;
  createdAt: string;
  updatedAt: string;
}
