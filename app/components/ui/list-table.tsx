import React from "react";
import { Pressable } from "react-native";

import { ListTableHeaderProps, ListTableRowProps } from "@/types/ui/listTable";

import { Box } from "@components/ui/box";
import { Text } from "@components/ui/text";

/**
 * Renders a table header row with column titles and optional action slot.
 *
 * Displays column headers in a flex row layout with borders and consistent typography.
 * Supports custom flex sizing per column and an optional action element slot.
 *
 * @template TItem - The type of data item being displayed in the table
 *
 * @param {ListTableHeaderProps<TItem>} props - Component props
 * @param {ListTableColumn<TItem>[]} props.columns - Column definitions including header text and flex sizing
 * @param {string} [props.className] - Additional CSS classes for the header container
 * @param {React.ReactNode} [props.action] - Optional action element to display (e.g., spacer for alignment with row actions)
 *
 * @returns {JSX.Element} The rendered header component
 *
 * @example
 * ```tsx
 * <ListTableHeader
 *   columns={[
 *     { key: "name", header: "Name", flexClassName: "flex-[2]" },
 *     { key: "quantity", header: "Quantity" }
 *   ]}
 *   action={<Box />}
 * />
 * ```
 */
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

/**
 * Renders a single data row in a list table with interactive states.
 *
 * Displays item data across columns with hover/pressed visual feedback.
 * Automatically formats primitive values (strings/numbers) as text, or renders custom React nodes.
 * Supports optional press handler and action element (e.g., edit button).
 *
 * @template TItem - The type of data item being displayed
 *
 * @param {ListTableRowProps<TItem>} props - Component props
 * @param {TItem} props.item - The data item to display in this row
 * @param {ListTableColumn<TItem>[]} props.columns - Column definitions matching the header
 * @param {() => void} [props.onPress] - Callback when the row is pressed/clicked
 * @param {React.ReactNode} [props.action] - Optional action element to display at the end (e.g., edit/delete button)
 * @param {string} [props.className] - Additional CSS classes for the row container
 *
 * @returns {JSX.Element} The rendered row component
 *
 * @example
 * ```tsx
 * <ListTableRow
 *   item={{ id: "1", name: "Item 1", quantity: 5 }}
 *   columns={[
 *     { key: "name", flexClassName: "flex-[2]" },
 *     { key: "quantity" }
 *   ]}
 *   onPress={() => router.push(`/items/1/edit`)}
 *   action={<Button><ButtonIcon as={Pencil} /></Button>}
 * />
 * ```
 */
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
