import { useMemo, useState } from "react";
import { ScrollView } from "react-native";

import mockCasesData from "@/data/mockCases.json";

import { Searchbar } from "@components/search";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "@components/ui/button";
import { HStack } from "@components/ui/hstack";
import { Text } from "@components/ui/text";
import { VStack } from "@components/ui/vstack";
import { router } from "expo-router";
import { Filter, Plus } from "lucide-react-native";

import { CasesActionRow } from "./casesActionRow";
import { CasesFilterDrawer } from "./casesFilterDrawer";
import { CasesTable } from "./casesTable";
import { NewCase } from "./new/newCase";

export type CaseStatus = "completed" | "cancelled" | "in-progress" | "pending";
export type TimeRange = "all" | "today" | "week" | "month" | "quarter" | "year";

export interface Case {
  id: string;
  customerName: string;
  date: string;
  status: CaseStatus;
  type: string;
  description: string;
}

export function CasesSection() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CaseStatus[]>(["completed", "cancelled", "in-progress", "pending"]);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  // Filter cases based on selected filters
  const filteredCases = useMemo(() => {
    let filtered = mockCasesData as Case[];

    // Filter by status
    filtered = filtered.filter((c) => selectedStatuses.includes(c.status as CaseStatus));

    // Filter by time range
    const now = new Date();
    filtered = filtered.filter((c) => {
      const caseDate = new Date(c.date);
      switch (timeRange) {
        case "today":
          return caseDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return caseDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return caseDate >= monthAgo;
        case "quarter":
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          return caseDate >= quarterAgo;
        case "year":
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return caseDate >= yearAgo;
        default:
          return true;
      }
    });

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [selectedStatuses, timeRange, searchQuery]);

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

      {/* <CasesActionRow /> */}
      <HStack className="my-6" space="md">
        <Searchbar placeholder="Søg efter sager..." className=" flex-grow" value={searchQuery} onChangeText={setSearchQuery} />
        <Button
          onPress={() => {
            setShowDrawer(true);
          }}
          variant="outline"
          className=" h-full"
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
          {filteredCases.length}
        </Text>
        <Text>af</Text>
        <Text bold className="text-primary-500">
          {mockCasesData.length}
        </Text>
        <Text>sager</Text>
      </HStack>
      <ScrollView>
        <CasesTable cases={filteredCases} />
      </ScrollView>
    </>
  );
}
