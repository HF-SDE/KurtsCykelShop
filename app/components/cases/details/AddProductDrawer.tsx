import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import apiClient from "@/utils/apiClient";

import { CameraView, useCameraPermissions } from "expo-camera";
import { ScanBarcode, Search, X } from "lucide-react-native";

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  barcodes?: string[];
}

interface AddProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrderId: string;
  onProductAdded: () => void;
}

export function AddProductDrawer({ isOpen, onClose, serviceOrderId, onProductAdded }: AddProductDrawerProps) {
  const [mode, setMode] = useState<"search" | "scan">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [amountInputFocused, setAmountInputFocused] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when drawer closes
      setMode("search");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedProduct(null);
      setQuantity("1");
      setScanned(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Debounced search
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const response = await apiClient.get(`/items/search?search=${encodeURIComponent(searchQuery)}`);

      if (response.data.status === "success" && response.data.data) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
      Alert.alert("Fejl", "Kunne ikke søge efter produkter");
    } finally {
      setSearching(false);
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    try {
      const response = await apiClient.get(`/items/barcode?barcode=${encodeURIComponent(data)}`);

      if (response.data.status === "success" && response.data.data) {
        setSelectedProduct(response.data.data);
        setMode("search"); // Switch back to search mode to show selected product
      } else {
        Alert.alert("Fejl", "Produkt ikke fundet");
        setScanned(false);
      }
    } catch (error) {
      console.error("Error fetching product by barcode:", error);
      Alert.alert("Fejl", "Produkt ikke fundet for stregkoden");
      setScanned(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setSearchResults([]);
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to add product
      // await apiClient.post(`/service-orders/${serviceOrderId}/parts`, {
      //   itemId: selectedProduct.id,
      //   quantity: parseInt(quantity),
      // });

      console.log("Adding product:", {
        serviceOrderId,
        productId: selectedProduct.id,
        quantity: parseInt(quantity),
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      onProductAdded();
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchMode = () => (
    <VStack
      space="lg"
      className={(inputFocused && !selectedProduct) || amountInputFocused ? "w-full pb-[320px]" : "w-full"}
    >
      {/* Search Input */}
      <VStack space="sm">
        <Text className="text-typography-700 font-medium">Søg efter produkt</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Navn eller SKU..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </Input>
      </VStack>

      {/* Search Results */}
      {searching && (
        <HStack space="sm" className="items-center justify-center py-4">
          <Spinner />
          <Text className="text-typography-500">Søger...</Text>
        </HStack>
      )}

      {!searching && searchResults.length > 0 && (
        <VStack space="xs" className="max-h-48">
          <Text className="text-typography-700 font-medium">Resultater</Text>
          <ActionsheetScrollView>
            {searchResults.map((product) => (
              <ActionsheetItem key={product.id} onPress={() => handleSelectProduct(product)}>
                <VStack space="xs" className="flex-1">
                  <ActionsheetItemText className="text-typography-900 font-semibold">
                    {product.name}
                  </ActionsheetItemText>
                  <HStack space="sm">
                    <Text className="text-typography-500 text-sm">SKU: {product.sku}</Text>
                    <Text className="text-typography-500 text-sm">•</Text>
                    <Text className="text-typography-500 text-sm">{product.price / 100} kr</Text>
                  </HStack>
                </VStack>
              </ActionsheetItem>
            ))}
          </ActionsheetScrollView>
        </VStack>
      )}

      {/* Selected Product */}
      {selectedProduct && (
        <VStack space="md" className="bg-background-50 border-outline-200 rounded-lg border p-4">
          <Text className="text-typography-700 font-medium">Valgt produkt</Text>
          <VStack space="xs">
            <Text className="text-typography-900 font-semibold">{selectedProduct.name}</Text>
            <Text className="text-typography-500 text-sm">SKU: {selectedProduct.sku}</Text>
            <Text className="text-typography-700">Pris: {selectedProduct.price / 100} kr</Text>
          </VStack>

          <VStack space="sm">
            <Text className="text-typography-700 font-medium">Antal</Text>
            <Input variant="outline" size="md">
              <InputField
                onFocus={() => setAmountInputFocused(true)}
                onBlur={() => setAmountInputFocused(false)}
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </Input>
          </VStack>

          <Button
            action="primary"
            variant="solid"
            size="lg"
            onPress={handleAddProduct}
            isDisabled={!quantity || parseInt(quantity) <= 0 || loading}
          >
            {loading ? <Spinner color="white" /> : <ButtonText>Tilføj produkt</ButtonText>}
          </Button>
        </VStack>
      )}
    </VStack>
  );

  const renderScanMode = () => {
    if (!permission) {
      return (
        <VStack space="md" className="items-center justify-center py-8 ">
          <Spinner />
          <Text className="text-typography-500">Indlæser kamera...</Text>
        </VStack>
      );
    }

    if (!permission.granted) {
      return (
        <VStack space="md" className="items-center justify-center py-8">
          <Text className="text-typography-700 text-center">Kameraadgang er påkrævet for at scanne stregkoder</Text>
          <Button action="primary" variant="solid" onPress={requestPermission}>
            <ButtonText>Giv adgang</ButtonText>
          </Button>
        </VStack>
      );
    }

    return (
      <VStack space="md" className="w-full">
        <Text className="text-typography-700 font-medium">Scan produktets stregkode</Text>
        <VStack className="overflow-hidden rounded-lg" style={{ height: 300 }}>
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["ean13", "code128"] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        </VStack>
        {scanned && (
          <Button action="secondary" variant="outline" onPress={() => setScanned(false)}>
            <ButtonText>Scan igen</ButtonText>
          </Button>
        )}
      </VStack>
    );
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack space="lg" className="w-full p-6 ">
          <Heading size="lg" className="text-typography-900">
            Tilføj produkt
          </Heading>

          {/* Mode Toggle */}
          <HStack space="sm">
            <Button
              action={mode === "search" ? "primary" : "secondary"}
              variant={mode === "search" ? "solid" : "outline"}
              size="md"
              onPress={() => setMode("search")}
              className="flex-1"
            >
              <ButtonIcon as={Search} />
              <ButtonText>Søg</ButtonText>
            </Button>
            <Button
              action={mode === "scan" ? "primary" : "secondary"}
              variant={mode === "scan" ? "solid" : "outline"}
              size="md"
              onPress={() => setMode("scan")}
              className="flex-1"
            >
              <ButtonIcon as={ScanBarcode} />
              <ButtonText>Scan</ButtonText>
            </Button>
          </HStack>

          {/* Content based on mode */}
          {mode === "search" ? renderSearchMode() : renderScanMode()}
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
}
