export interface ServiceOrderInvoice {
  serviceOrderId: string;
  price: number;
  issuedAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
