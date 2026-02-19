import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon } from "@components/ui/button";
import { useRouter } from "expo-router";
import { ListFilter, Pencil, Plus, ScanText } from "lucide-react-native";

const data = [
  { name: "John Doe", quantity: 2 },
  { name: "Foo Bar", quantity: 6 },
  { name: "Ben Dover", quantity: 7 },
  { name: "John Doe", quantity: 2 },
  { name: "Foo Bar", quantity: 6 },
  { name: "Ben Dover", quantity: 7 },
  { name: "John Doe", quantity: 2 },
  { name: "Foo Bar", quantity: 6 },
  { name: "Ben Dover", quantity: 7 },
  { name: "John Doe", quantity: 2 },
  { name: "Foo Bar", quantity: 6 },
  { name: "Ben Dover", quantity: 7 },
];

export default function Storage() {
  const router = useRouter();

  return (
    <Box className="bg-background-0 w-full flex-1 overflow-hidden p-2">
      <Box className="mb-8 w-full flex-row justify-between">
        <Box className="w-1/2 ">
          <Searchbar />
        </Box>

        <ButtonGroup className="mb-5 h-full flex-row items-center justify-between gap-2">
          <Button variant="outline" className="h-full" onPress={() => router.push("/storage/barcode-scanner")}>
            <ButtonIcon as={ScanText} />
          </Button>

          <Button variant="outline" className="h-full">
            <ButtonIcon as={ListFilter} />
          </Button>

          <Button variant="outline" className="h-full" onPress={() => router.push("/storage/new-item")}>
            <ButtonIcon as={Plus} />
          </Button>
        </ButtonGroup>
      </Box>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              <TableData>{item.name}</TableData>
              <TableData>{item.quantity}</TableData>
              <TableData>
                <Button variant="outline" className="!border-0">
                  <ButtonIcon size="3xl" as={Pencil} />
                </Button>
              </TableData>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
