export interface ServiceOrder {
  id: string;
  customerId: string;
  description: string;
  estimatedCompletion: string; // ISO date string
  completedAt?: string; // ISO date string
  assignedToId?: string;
  assignedById: string;
  status: string;

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
