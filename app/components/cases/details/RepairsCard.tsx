import React, { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { AddRepairDrawer } from "@components/cases/details/AddRepairDrawer";
import { ChevronDown, ChevronUp, Plus } from "lucide-react-native";

interface Repair {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

interface RepairsCardProps {
  repairs: Repair[];
  serviceOrderId: string;
  onRepairAdded?: () => void;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function RepairsCard({ repairs, serviceOrderId, onRepairAdded }: RepairsCardProps) {
  const [showDrawer, setShowDrawer] = useState(false);

  const handleRepairAdded = () => {
    setShowDrawer(false);
    onRepairAdded?.();
  };

  return (
    <>
      <VStack space="md" className="bg-background-0 border-outline-100 rounded-lg border p-4">
        <HStack className="items-center justify-between">
          <Heading size="lg" className="text-typography-900">
            Reparationer
          </Heading>
          <Button action="primary" variant="solid" size="sm" onPress={() => setShowDrawer(true)}>
            <ButtonIcon as={Plus} />
            <ButtonText>Tilføj</ButtonText>
          </Button>
        </HStack>

        {repairs.length === 0 ? (
          <Text className="text-typography-500 py-4 text-center">Ingen reparationer endnu</Text>
        ) : (
          <Accordion variant="filled" size="md" type="multiple" className="mt-2">
            {repairs.map((repair, index) => (
              <AccordionItem key={repair.id} value={`item-${index}`}>
                <AccordionHeader>
                  <AccordionTrigger>
                    {({ isExpanded }: { isExpanded: boolean }) => (
                      <>
                        <AccordionTitleText>{repair.title}</AccordionTitleText>
                        <AccordionIcon as={isExpanded ? ChevronUp : ChevronDown} />
                      </>
                    )}
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>
                  <VStack space="sm">
                    <AccordionContentText>{repair.description}</AccordionContentText>
                    <HStack space="sm" className="mt-2 items-center">
                      <Text className="text-typography-500 text-xs">{formatDateTime(repair.createdAt)}</Text>
                      {repair.createdBy && (
                        <>
                          <Text className="text-typography-500 text-xs">•</Text>
                          <Text className="text-typography-500 text-xs">
                            {repair.createdBy.firstName} {repair.createdBy.lastName}
                          </Text>
                        </>
                      )}
                    </HStack>
                  </VStack>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </VStack>

      <AddRepairDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        serviceOrderId={serviceOrderId}
        onRepairAdded={handleRepairAdded}
      />
    </>
  );
}
