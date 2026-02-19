import React, { useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView } from "react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { useRouter } from "expo-router";
import { ChevronLeft, Pencil, Plus, Search } from "lucide-react-native";

type Role = { id: string; name: string };

export default function RolesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const roles: Role[] = [
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

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <Box className="bg-background-0 flex-1 px-5 pt-2">
      <HStack className="mb-6 mt-2 items-center justify-between">
        <Button onPress={() => router.back()}>
          <ButtonIcon as={ChevronLeft} size="lg" />
        </Button>

        <Button className="h-10 rounded-md px-4">
          <ButtonText className="font-semibold ">Create</ButtonText>
          <ButtonIcon as={Plus} />
        </Button>
      </HStack>

      <HStack className="mb-3 items-center gap-2">
        <Input className="h-11 flex-1 rounded-lg border border-[#CFCFCF] bg-[#EFEFEF]">
          <InputSlot className="pl-3">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField value={search} onChangeText={setSearch} placeholder="Search" className="text-sm" />
        </Input>

        <Button variant="outline" className="h-11 min-w-[92px] rounded-lg border-[#CFCFCF] bg-[#EFEFEF]">
          <ButtonText className="text-[#444]">Filter</ButtonText>
          <ButtonIcon as={Plus} className="text-[#444]" />
        </Button>
      </HStack>

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
  );
}
