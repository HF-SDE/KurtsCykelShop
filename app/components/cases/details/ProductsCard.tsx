import React, { useState } from "react";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { ServicePartsUsedWithItem } from "@/types/serviceOrders/Extentions/ServicePartsUsedWithItem";

import { AddProductDrawer } from "@components/cases/details/AddProductDrawer";
import { Plus } from "lucide-react-native";

interface ProductsCardProps {
  products: ServicePartsUsedWithItem[];
  serviceOrderId: string;
  onProductAdded?: () => void;
}

export function ProductsCard({ products, serviceOrderId, onProductAdded }: ProductsCardProps) {
  const [showDrawer, setShowDrawer] = useState(false);

  const handleProductAdded = () => {
    setShowDrawer(false);
    onProductAdded?.();
  };

  return (
    <>
      <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
        <HStack className="items-center justify-between">
          <Heading size="lg" className="text-typography-900">
            Produkter brugt
          </Heading>
          <Button action="primary" variant="solid" size="sm" onPress={() => setShowDrawer(true)}>
            <ButtonIcon as={Plus} />
            <ButtonText>Tilføj</ButtonText>
          </Button>
        </HStack>

        {products.length === 0 ? (
          <Text className="text-typography-500 py-4 text-center">Ingen produkter endnu</Text>
        ) : (
          <Table className="mt-2 w-full">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Text className="text-typography-700 text-sm font-semibold">Produkt</Text>
                </TableHead>
                <TableHead>
                  <Text className="text-typography-700 text-sm font-semibold">Antal</Text>
                </TableHead>
                <TableHead>
                  <Text className="text-typography-700 text-right text-sm font-semibold">Total</Text>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products
                .filter((part) => part.item != null)
                .map((part) => {
                  if (!part.item) return null;
                  return (
                    <TableRow key={part.id}>
                      <TableData>
                        <VStack space="xs">
                          <Text className="text-typography-900 font-medium">{part.item.name}</Text>
                          <Text className="text-typography-500 text-xs">SKU: {part.item.sku}</Text>
                        </VStack>
                      </TableData>
                      <TableData>
                        <Text className="text-typography-700">{part.quantity}</Text>
                      </TableData>
                      <TableData>
                        <Text className="text-typography-700 text-right">
                          {((part.item.price * part.quantity) / 100).toFixed(2)} kr
                        </Text>
                      </TableData>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </VStack>

      <AddProductDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        serviceOrderId={serviceOrderId}
        onProductAdded={handleProductAdded}
      />
    </>
  );
}
