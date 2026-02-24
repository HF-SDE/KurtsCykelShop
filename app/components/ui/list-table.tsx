import React from "react";
import { Pressable } from "react-native";

import { ListTableHeaderProps, ListTableRowProps } from "@/types/ui/listTable";

import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";

export function ListTableHeader<TItem>({ columns, className = "", action }: ListTableHeaderProps<TItem>) {
  return (
    <Box className={`border-outline-200 bg-background-0 flex-row border-b ${className}`.trim()}>
      {columns.map((column) => (
        <Text
          key={column.key}
          className={`text-typography-800 px-6 py-[14px] text-left text-[16px] font-bold leading-[22px] ${column.flexClassName ?? "flex-1"}`}
        >
          {column.header ?? ""}
        </Text>
      ))}

      {action ? <Box className="flex-1 px-4 py-[7px]">{action}</Box> : null}
    </Box>
  );
}

export function ListTableRow<TItem>({ item, columns, onPress, action, className = "" }: ListTableRowProps<TItem>) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      {({ hovered, pressed }) => (
        <Box
          className={`border-outline-200 flex-row border-b ${pressed ? "bg-background-100" : hovered ? "bg-background-50" : "bg-background-0"} ${className}`.trim()}
        >
          {columns.map((column) => {
            const content = item[column.key] as React.ReactNode;

            return (
              <Box
                key={column.key}
                className={`${column.flexClassName ?? "flex-1"} justify-center`}
                pointerEvents="none"
              >
                {typeof content === "string" || typeof content === "number" ? (
                  <Text className="text-typography-800 px-6 py-[14px] text-left text-[16px] font-medium leading-[22px]">
                    {content}
                  </Text>
                ) : (
                  content
                )}
              </Box>
            );
          })}

          {action ? (
            <Box className="flex-1 items-end justify-center px-4 py-[7px]" pointerEvents="none">
              {action}
            </Box>
          ) : null}
        </Box>
      )}
    </Pressable>
  );
}
