export interface CustomerLog {
  id: string;
  customerId: string;
  tableField: string;
  oldValue?: string;
  newValue?: string;
  changedById: string;
  changedByName: string;
  createdAt: string;
  updatedAt: string;
}
