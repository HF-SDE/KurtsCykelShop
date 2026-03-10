import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CaseRow } from "@/components/cases/case-row";
import { CaseTableHeader } from "@/components/cases/case-table-header";

import { ServiceOrderData } from "@/types/serviceOrders/Extentions/ServiceOrderData";

import { CaseStatus, CaseStatusValues, CasesFilterDrawer, TimeRange } from "@components/cases/cases-filter-drawer";
import FoxLoader from "@components/fox";
import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@components/ui/button";
import { Center } from "@components/ui/center";
import { HStack } from "@components/ui/hstack";
import { Spinner } from "@components/ui/spinner";
import { Text } from "@components/ui/text";
import { router, useRouter } from "expo-router";
import { Filter, Plus } from "lucide-react-native";

import { fetchCasesPage } from "./actions/serviceOrders";

export default function CasesScreen() {
  const routerNav = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CaseStatus[]>(CaseStatusValues);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const [cases, setCases] = useState<ServiceOrderData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPage = useRef(1);
  const isFirstLoad = useRef(true);

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      try {
        const result = await fetchCasesPage(page, searchQuery, selectedStatuses, timeRange);
        if (result) {
          const { items, hasMore: more, total: totalCount } = result;
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
    if (isFirstLoad.current) setIsLoading(true);
    try {
      await loadPage(1, false);
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  }, [loadPage]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPage(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      await loadPage(currentPage.current + 1, true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadPage, hasMore, isLoadingMore]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading && isFirstLoad.current) {
    return (
      <SafeAreaView className="bg-background-0 flex-1 p-4" edges={{ top: "additive" }}>
        <Center className="flex-1">
          <FoxLoader />
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background-0 flex-1 p-4" edges={{ top: "additive" }}>
      <HStack className="flex items-center justify-between">
        <Text size="4xl" bold>
          Sager
        </Text>
        <Button onPress={() => router.push("/case/new")} action="default" variant="solid" className="bg-secondary-950">
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
        <Button onPress={() => setShowDrawer(true)} variant="outline" className="h-full" action="secondary">
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
          ListHeaderComponent={<CaseTableHeader />}
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
    </SafeAreaView>
  );
}
