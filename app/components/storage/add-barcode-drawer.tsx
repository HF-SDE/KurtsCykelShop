import { useState } from "react";

import { Box } from "@components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@components/ui/button";
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@components/ui/drawer";
import { Heading } from "@components/ui/heading";
import { Icon } from "@components/ui/icon";
import { Text } from "@components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@components/ui/toast";
import { ScanText, Trash } from "lucide-react-native";

import { ActionSheetBarcodeScanner } from "./action-sheet-barcode-scanner";

interface AddBarcodeProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  barcodes: string[];
  onAddBarcode: (barcode: string) => void;
  onRemoveBarcode: (barcode: string) => void;
  headerText?: string;
  noBarcodesText?: string;
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
  const toast = useToast();

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  function handleAddBarcode(barcode: string) {
    if (barcodes.includes(barcode)) {
      toast.show({
        id: "barcode-exists:" + barcode,
        render: () => (
          <Toast>
            <ToastTitle>Stregkode allerede tilføjet</ToastTitle>
            <ToastDescription>Stregkoden {barcode} er allerede i listen.</ToastDescription>
          </Toast>
        ),
      });

      return;
    }

    onAddBarcode(barcode);
    setIsScannerOpen(false);
  }

  return (
    <Drawer isOpen={isOpen} size="md" anchor="right" onClose={() => setIsOpen(false)}>
      <DrawerBackdrop />
      <DrawerContent className="items-center pb-10 pt-20">
        <DrawerHeader>
          <Heading size="lg">{headerText || "Tilføj stregkode"}</Heading>
        </DrawerHeader>
        <DrawerBody className="w-full">
          <ActionSheetBarcodeScanner
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onBarcodeScanned={handleAddBarcode}
          />
          <Button variant="outline" className="mb-4" onPress={() => setIsScannerOpen(true)}>
            <ButtonText>Scan stregkode</ButtonText>
            <ButtonIcon as={ScanText} />
          </Button>

          {barcodes.length > 0 ? (
            <Box className="flex-1 gap-1">
              {barcodes.map((barcode) => (
                <Box
                  key={barcode}
                  className="bg-muted flex-row items-center justify-between gap-1 rounded-md px-1 py-1"
                >
                  <Text>{barcode}</Text>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 border-0"
                    onPress={() => onRemoveBarcode(barcode)}
                  >
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
