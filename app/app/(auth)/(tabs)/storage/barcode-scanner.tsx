import { useEffect, useState } from "react";

import { Box } from "@components/ui/box";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/text";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function BarcodeScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!permission) return;

    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  function onBarcodeScanned({ type, data }: { type: string; data: string }) {
    console.log(`Scanned barcode with type ${type} and data ${data}`);

    setIsActive(false);
  }

  if (!permission) {
    return (
      <Box className="bg-background-0 flex-1 items-center justify-center px-6">
        <Text>Loading camera permissions...</Text>
      </Box>
    );
  }

  if (!permission.granted) {
    return (
      <Box className="bg-background-0 flex-1 items-center justify-center gap-4 px-6">
        <Text className="text-center">Camera permission is required to scan barcodes.</Text>
        <Button onPress={requestPermission}>
          <Text>Grant camera access</Text>
        </Button>
      </Box>
    );
  }

  return (
    <Box className="bg-background-0 flex-1">
      <Box className="flex h-48 w-96 self-center overflow-hidden rounded-lg">
        <CameraView
          style={{ flex: 1 }}
          active={isActive}
          barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
          facing="back"
          onBarcodeScanned={onBarcodeScanned}
        />
      </Box>
    </Box>
  );
}
