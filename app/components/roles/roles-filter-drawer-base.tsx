import { ReactNode } from "react";

import { Button, ButtonText } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";

import { Heading } from "@components/ui/heading";
import { HStack } from "@components/ui/hstack";
import { Icon } from "@components/ui/icon";
import { XIcon } from "lucide-react-native";

interface RolesFilterDrawerBaseProps {
  showDrawer: boolean;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  children: ReactNode;
}

export function RolesFilterDrawerBase({ showDrawer, onClose, onReset, onApply, children }: RolesFilterDrawerBaseProps) {
  return (
    <Drawer isOpen={showDrawer} size="lg" anchor="right" onClose={onClose}>
      <DrawerBackdrop />
      <DrawerContent className="px-8">
        <DrawerHeader className="mt-16">
          <Heading size="lg">Filtre</Heading>
          <DrawerCloseButton>
            <Icon as={XIcon} />
          </DrawerCloseButton>
        </DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
        <DrawerFooter>
          <HStack space="md" className="w-full">
            <Button variant="outline" onPress={onReset} className="flex-1">
              <ButtonText>Nulstil</ButtonText>
            </Button>
            <Button variant="solid" action="primary" onPress={onApply} className="flex-1">
              <ButtonText>Anvend</ButtonText>
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
