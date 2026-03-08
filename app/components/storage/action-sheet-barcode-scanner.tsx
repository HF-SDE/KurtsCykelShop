import { useCallback, useEffect, useRef } from "react";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";

import { Box } from "@components/ui/box";
import { Button, ButtonText } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";

interface ActionSheetBarcodeScannerProps {
  isOpen: boolean;
  onClose?: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export function ActionSheetBarcodeScanner({ onBarcodeScanned, isOpen, onClose }: ActionSheetBarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  useEffect(() => {
    if (!permission) return;

    if (!permission.granted && permission.canAskAgain && isOpen) {
      requestPermission();
    }
  }, [permission, requestPermission, isOpen]);

  const handleBarcodeScanned = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      onBarcodeScanned(data);

      setTimeout(() => (hasScannedRef.current = false), 1000);
    },
    [onBarcodeScanned],
  );

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose} snapPoints={[35]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="bg-background-0">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Box className="items-center gap-8 py-4">
          {!permission || !permission.granted ? (
            <>
              <Heading size="lg">Kamera adgang krævet</Heading>
              <Button variant="outline" onPress={requestPermission}>
                <ButtonText>Giv adgang til kamera</ButtonText>
              </Button>
            </>
          ) : (
            <>
              <Heading size="lg">Scan stregkode</Heading>

              <Box className="bg-background-0 flex-1">
                <Box className="flex h-48 w-96 self-center overflow-hidden rounded-lg">
                  <CameraView
                    style={{ flex: 1 }}
                    active={isOpen}
                    className="aspect-square w-full rounded-lg"
                    barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
                    facing="back"
                    onBarcodeScanned={handleBarcodeScanned}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </ActionsheetContent>
    </Actionsheet>
  );
}
