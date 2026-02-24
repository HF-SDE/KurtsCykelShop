export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  minSellQuantity: number;
  price: number;
  purchasePrice: number;
  isPublic: boolean;
  unitId: string;
  statusId: string;
  locationId: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}
