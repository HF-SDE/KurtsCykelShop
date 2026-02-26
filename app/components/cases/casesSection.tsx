import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable } from "react-native";

import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

import FoxLoader from "@components/fox";
import { Searchbar } from "@components/search";
import { Badge, BadgeText } from "@components/ui/badge";
import { Box } from "@components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@components/ui/button";
import { Center } from "@components/ui/center";
import { HStack } from "@components/ui/hstack";
import { Spinner } from "@components/ui/spinner";
import { Text } from "@components/ui/text";
import { PaginatedResponse } from "@hooks/usePaginatedData";
import { APIResponse } from "@utils/ApiResponse";
import apiClient from "@utils/apiClient";
import { router, useRouter } from "expo-router";
import { Filter, Plus } from "lucide-react-native";

import { CaseStatus, CaseStatusValues, CasesFilterDrawer, TimeRange } from "./casesFilterDrawer";

const statusConfig: Record<string, { action: "success" | "warning" | "info" | "error"; label: string }> = {
  completed: { action: "success", label: "Afsluttet" },
  cancelled: { action: "error", label: "Annuleret" },
  "in-progress": { action: "info", label: "I gang" },
  pending: { action: "warning", label: "Afventer" },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function TableHeader() {
  return (
    <Box className="border-outline-200 bg-background-0 flex-row border-b">
      <Text className="text-typography-800 flex-[2] px-6 py-[14px] text-left text-[16px] font-bold leading-[22px]">
        Kunde
      </Text>
      <Text className="text-typography-800 flex-1 px-6 py-[14px] text-left text-[16px] font-bold leading-[22px]">
        Dato
      </Text>
      <Text className="text-typography-800 flex-1 px-6 py-[14px] text-left text-[16px] font-bold leading-[22px]">
        Status
      </Text>
    </Box>
  );
}

function CaseRow({ caseItem, onPress }: { caseItem: ServiceOrderData; onPress: () => void }) {
  const statusInfo = statusConfig[caseItem.status] || {
    action: "info" as const,
    label: caseItem.status,
  };

  return (
    <Pressable onPress={onPress}>
      {({ hovered, pressed }) => (
        <Box
          className={`border-outline-200 flex-row border-b ${pressed ? "bg-background-100" : hovered ? "bg-background-50" : "bg-background-0"}`}
        >
          <Box className="flex-[2] justify-center" pointerEvents="none">
            <Text className="text-typography-800 px-6 py-[14px] text-left text-[16px] font-medium leading-[22px]">
              {caseItem.customer ? `${caseItem.customer.firstName} ${caseItem.customer.lastName}` : "Ukendt kunde"}
            </Text>
          </Box>
          <Box className="flex-1 justify-center" pointerEvents="none">
            <Text className="text-typography-800 px-6 py-[14px] text-left text-[16px] font-medium leading-[22px]">
              {formatDate(caseItem.createdAt)}
            </Text>
          </Box>
          <Box className="flex-1 items-start justify-center px-6 py-[7px]">
            <Badge action={statusInfo.action}>
              <BadgeText>{statusInfo.label}</BadgeText>
            </Badge>
          </Box>
        </Box>
      )}
    </Pressable>
  );
}

export function CasesSection() {
  const routerNav = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CaseStatus[]>(CaseStatusValues);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  // Pagination state
  const [cases, setCases] = useState<ServiceOrderData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPage = useRef(1);
  const isFirstLoad = useRef(true);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      try {
        const response = await apiClient.get<APIResponse<PaginatedResponse<ServiceOrderData>>>(
          "/service-orders/paginated",
          {
            params: {
              page,
              limit: 20,
              search: searchQuery || undefined,
              statuses: selectedStatuses.join(","),
              timeRange,
            },
          },
        );

        if (response.data?.data) {
          const { data: items, hasMore: more, total: totalCount } = response.data.data;
          setCases((prev) => (append ? [...prev, ...items] : items));
          setHasMore(more);
          setTotal(totalCount);
          currentPage.current = page;
        }
      } catch (err) {
        console.error("Error fetching cases:", err);
      }
    },
    [searchQuery, selectedStatuses, timeRange],
  );

  const load = useCallback(async () => {
    if (isFirstLoad.current) {
      setIsLoading(true);
    }
    try {
      await fetchPage(1, false);
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchPage(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      await fetchPage(currentPage.current + 1, true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, hasMore, isLoadingMore]);

  // Load data on mount and when filters change
  useEffect(() => {
    load();
  }, [load]);

  // Show loading spinner only on first page visit
  if (isLoading && isFirstLoad.current) {
    return (
      <Center className="flex-1">
        <FoxLoader />
      </Center>
    );
  }

  return (
    <>
      <HStack className="flex items-center justify-between">
        <Text size="4xl" bold>
          Sager
        </Text>
        <Button
          onPress={() => {
            router.push("/case/new");
          }}
          action="default"
          variant="solid"
          className="bg-secondary-950"
        >
          <ButtonText className="text-typography-100">Opret ny</ButtonText>
          <ButtonIcon as={Plus} className="text-typography-100" />
        </Button>
      </HStack>

      <HStack className="my-6" space="md">
        <Searchbar
          placeholder="Søg efter sager..."
          className="flex-grow"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button
          onPress={() => {
            setShowDrawer(true);
          }}
          variant="outline"
          className="h-full"
          action="secondary"
        >
          <ButtonIcon as={Filter} className="text-typography-950" />
        </Button>
        <CasesFilterDrawer
          showDrawer={showDrawer}
          setShowDrawer={setShowDrawer}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      </HStack>
      <HStack space="xs" className="mb-4">
        <Text>Viser</Text>
        <Text bold className="text-primary-500">
          {cases.length}
        </Text>
        <Text>af</Text>
        <Text bold className="text-primary-500">
          {total}
        </Text>
        <Text>sager</Text>
      </HStack>

      {cases.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={cases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CaseRow caseItem={item} onPress={() => routerNav.push(`/case/${item.id}`)} />}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={<TableHeader />}
          stickyHeaderIndices={[0]}
          onRefresh={refresh}
          refreshing={isRefreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <Box className="items-center py-4">
                <Spinner />
              </Box>
            ) : null
          }
        />
      ) : (
        <Box className="bg-background-0 flex-1 items-center justify-center">
          <Text size="lg" className="text-typography-500 mb-4">
            Ingen sager fundet med de valgte filtre
          </Text>
        </Box>
      )}
    </>
  );
}
