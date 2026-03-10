import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

import { CaseStatus, TimeRange } from "@components/cases/cases-filter-drawer";
import { PaginatedResponse } from "@hooks/usePaginatedData";
import { APIResponse } from "@utils/ApiResponse";
import apiClient from "@utils/apiClient";

export async function fetchCasesPage(
  page: number,
  searchQuery: string,
  selectedStatuses: CaseStatus[],
  timeRange: TimeRange,
): Promise<{ items: ServiceOrderData[]; hasMore: boolean; total: number } | null> {
  const response = await apiClient.get<APIResponse<PaginatedResponse<ServiceOrderData>>>("/service-orders/paginated", {
    params: {
      page,
      limit: 20,
      search: searchQuery || undefined,
      statuses: selectedStatuses.join(","),
      timeRange,
    },
  });

  if (response.data?.data) {
    const { data: items, hasMore, total } = response.data.data;
    return { items, hasMore, total };
  }

  return null;
}
