import React, { useMemo, useState } from "react";

import { Box } from "@/components/ui/box";
import { Button, ButtonGroup, ButtonIcon } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { NavigationButton } from "@components/navigation-button";
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
  { id: "9", name: "Admin Admin" },
  { id: "9", name: "Admin Admin" },
  { id: "9", name: "Admin Admin" },
  { id: "9", name: "Admin Admin" },
  { id: "9", name: "Admin Admin" },
];

export default function RolesPage() {
  const [search, setSearch] = useState("");

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ROLES;
    return ROLES.filter((r) => r.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <Box className="bg-background-0 w-full flex-1 overflow-hidden p-2">
      <Box className="mb-8 w-full flex-row justify-between gap-4">
        <Searchbar className="h-full flex-1" placeholder="Search roles..." value={search} onChangeText={setSearch} />

        <ButtonGroup className="mb-5 h-full flex-row items-center justify-between gap-2">
          <Button variant="outline" action="secondary" className="h-full">
            <ButtonIcon as={ListFilter} />
          </Button>

          <NavigationButton variant="outline" action="secondary" className="h-full" href="/admin/roles/new">
            <ButtonIcon as={Plus} />
          </NavigationButton>
        </ButtonGroup>
      </Box>

      {filteredRoles.length ? (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRoles.map((item, i) => (
              <TableRow key={i}>
                <TableData>{item.name}</TableData>
                <TableData>
                  <NavigationButton
                    variant="outline"
                    action="secondary"
                    className="!border-0"
                    href={`/admin/roles/${item.id}/edit`}
                  >
                    <ButtonIcon size="3xl" as={Pencil} />
                  </NavigationButton>
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box className="bg-background-0 flex-1 items-center justify-center">
          <Text size="lg">Error: No roles found</Text>
        </Box>
      )}
    </Box>
  );
}
