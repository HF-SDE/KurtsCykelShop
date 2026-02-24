import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

export type CaseStatus = "completed" | "cancelled" | "in-progress" | "pending";
export const CaseStatusValues: CaseStatus[] = ["completed", "cancelled", "in-progress", "pending"];
export type TimeRange = "all" | "today" | "week" | "month" | "quarter" | "year";

export interface PaginatedResponse {
  items: ServiceOrderData[];
  total: number;
  page: number;
  hasMore: boolean;
}
