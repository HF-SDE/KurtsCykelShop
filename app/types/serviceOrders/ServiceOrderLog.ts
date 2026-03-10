export interface ServiceOrderLog {
  id: string;
  serviceOrderId: string;
  tableField: string;
  oldValue?: string;
  newValue?: string;
  changedById: string;
  changedByName: string;
  createdAt: string;
  updatedAt: string;
}
