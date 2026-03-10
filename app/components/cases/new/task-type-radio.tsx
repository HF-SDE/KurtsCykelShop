import React from "react";

import { CircleIcon } from "@/components/ui/icon";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export type TaskType = "service" | "repair";

interface TaskTypeRadioProps {
  value: TaskType;
  onChange: (value: TaskType) => void;
}

export function TaskTypeRadio({ value, onChange }: TaskTypeRadioProps) {
  return (
    <VStack space="sm">
      <Text className="text-typography-700 font-medium">Opgave type</Text>
      <RadioGroup value={value} onChange={onChange}>
        <VStack space="sm">
          <Radio value="service" size="md">
            <RadioIndicator>
              <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel className="text-typography-700">Service eftersyn</RadioLabel>
          </Radio>
          <Radio value="repair" size="md">
            <RadioIndicator>
              <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel className="text-typography-700">Reparation</RadioLabel>
          </Radio>
        </VStack>
      </RadioGroup>
    </VStack>
  );
}
