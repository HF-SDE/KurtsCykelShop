import { Box } from "@components/ui/box";
import { Button, ButtonText } from "@components/ui/button";
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@components/ui/drawer";
import { Heading } from "@components/ui/heading";
import { Icon } from "@components/ui/icon";
import { Text } from "@components/ui/text";
import { Trash } from "lucide-react-native";

interface AddBarcodeProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  barcodes: string[];
  onAddBarcode: (barcode: string) => void;
  onRemoveBarcode: (barcode: string) => void;
  headerText?: string;
  noBarcodesText?: string;
}

function generateId() {
  const id = Math.floor(Math.random() * 10 ** 13)
    .toString()
    .padStart(13, "0");
  return id;
}

export function AddBarcode({
  isOpen,
  setIsOpen,
  barcodes,
  onAddBarcode,
  onRemoveBarcode,
  headerText,
  noBarcodesText,
}: AddBarcodeProps) {
  return (
    <Drawer isOpen={isOpen} size="md" anchor="right" onClose={() => setIsOpen(false)}>
      <DrawerBackdrop />
      <DrawerContent className="items-center pb-10 pt-20">
        <DrawerHeader>
          <Heading size="lg">{headerText || "Tilføj stregkode"}</Heading>
          {/* <DrawerCloseButton>
            <Icon as={CloseIcon} />
          </DrawerCloseButton> */}
        </DrawerHeader>
        <DrawerBody className="w-full">
          <Button variant="outline" onPress={() => onAddBarcode(generateId())} className="mb-4">
            <ButtonText>Scan stregkode</ButtonText>
          </Button>
          {barcodes.length > 0 ? (
            <Box className="flex-1 gap-1">
              {barcodes.map((barcode) => (
                <Box
                  key={barcode}
                  className="bg-muted flex-row items-center justify-between gap-1 rounded-md px-1 py-1"
                >
                  <Text>{barcode}</Text>

                  <Button variant="outline" size="sm" className="w-10 border-0" onPress={() => onRemoveBarcode(barcode)}>
                    <Icon as={Trash} className="justify-end" />
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
            <Text className="text-center">{noBarcodesText || "Ingen stregkoder tilføjet endnu."}</Text>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button className="flex-1" variant="outline" onPress={() => setIsOpen(false)}>
            <ButtonText>Annuller</ButtonText>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
