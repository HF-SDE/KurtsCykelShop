import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { Searchbar } from "@components/search";
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { ListFilter, Pencil, Plus } from "lucide-react-native";

type Role = { id: string; name: string };

const ROLES: Role[] = [
  { id: "1", name: "Admin" },
  { id: "2", name: "Manager" },
  { id: "3", name: "Sale" },
  { id: "4", name: "Marketing" },
  { id: "5", name: "Vendor Contact" },
  { id: "6", name: "Marketing Manager" },
  { id: "7", name: "CSM" },
  { id: "8", name: "Safe Arch" },
  { id: "9", name: "Admin Admin" },
];

export default function RolesPage() {
  const [search] = useState("");
  const headerHeight = Platform.OS === "ios" ? 44 : 56;

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ROLES;
    return ROLES.filter((r) => r.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <SafeAreaView className="bg-background-0 flex-1">
      <Box className={`overflow-hidden rounded-xl border border-[#CBCBCB] px-5`}>
        <HStack className="gap-2">
          <Box className="flex-1">
            <Searchbar />
          </Box>

          <ButtonGroup className="h-full flex-row items-center justify-between">
            <Button variant="outline" className="h-full">
              <ButtonIcon as={ListFilter} />
            </Button>

            <Button variant="outline" className="h-full">
              <ButtonIcon as={Plus} />
            </Button>
          </ButtonGroup>
        </HStack>

        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRoles.map((item, i) => (
              <TableRow key={item.id}>
                <TableData>{item.name}</TableData>
                <TableData>
                  <Button variant="outline" className="!border-0">
                    <ButtonIcon size="3xl" as={Pencil} />
                  </Button>
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box className="overflow-hidden rounded-xl border border-[#CBCBCB] bg-[#F6F6F6]">
          <HStack className="h-12 items-center justify-between bg-[#EDEDED] px-6">
            <Text className="text-base font-bold text-[#3C3C3C]">Name</Text>
            <Text className="text-base font-bold text-[#3C3C3C]">Action</Text>
          </HStack>

          <FlatList
            data={filteredRoles}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Box className="h-[1px] bg-[#DDDDDD]" />}
            renderItem={({ item }) => (
              <HStack className="min-h-[50px] items-center justify-between bg-[#F7F7F7] px-6">
                <Text className="text-[15px] text-[#444]">{item.name}</Text>
                <Pressable className="p-1">
                  <Icon as={Pencil} size="md" />
                </Pressable>
              </HStack>
            )}
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
}
