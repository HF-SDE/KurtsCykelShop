import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Searchbar } from "@components/search";
import { Box } from "@components/ui/box";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@components/ui/button";
import { ListFilter, Plus, ScanText } from "lucide-react-native";

export default function Storage() {
  return (
    <Box className="bg-background-0 w-full flex-1 overflow-hidden px-5">
      <Box className="mb-8">
        <ButtonGroup className="mb-5 flex-row items-center justify-between py-2 outline outline-1 outline-white">
          <Button size="lg" variant="outline">
            <ButtonText>Scan</ButtonText>
            <ButtonIcon as={ScanText} />
          </Button>

          <Button size="lg" variant="outline">
            <ButtonText>Filter</ButtonText>
            <ButtonIcon as={ListFilter} />
          </Button>

          <Button size="lg" variant="outline">
            <ButtonText>Create</ButtonText>
            <ButtonIcon as={Plus} />
          </Button>
        </ButtonGroup>

        <Searchbar />
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
          <TableRow>
            <TableData>John Doe</TableData>
            <TableData>2</TableData>
            <TableData>
              <Button className="text-primary-500 hover:underline">
                <ButtonText>View</ButtonText>
              </Button>
            </TableData>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}
