import React from "react";

/**
 * Column definition for a list table.
 *
 * @template TItem - The type of data item being displayed in the table
 *
 * @property {Extract<keyof TItem, string>} key - The property key from the item to display in this column
 * @property {string} [header] - Optional header text to display at the top of the column
 * @property {string} [flexClassName] - Optional Tailwind flex class (e.g., "flex-1", "flex-[2]") to control column width
 */
export type ListTableColumn<TItem> = {
  key: Extract<keyof TItem, string>;
  header?: string;
  flexClassName?: string;
};

/**
 * Props for the ListTableHeader component.
 *
 * @template TItem - The type of data item being displayed in the table
 *
 * @property {ListTableColumn<TItem>[]} columns - Array of column definitions for the header
 * @property {string} [className] - Optional additional CSS classes for the header container
 * @property {React.ReactNode} [action] - Optional action element to display in the header (e.g., action buttons)
 */
export type ListTableHeaderProps<TItem> = {
  columns: ListTableColumn<TItem>[];
  className?: string;
  action?: React.ReactNode;
};

/**
 * Props for the ListTableRow component.
 *
 * @template TItem - The type of data item being displayed in the table
 *
 * @property {TItem} item - The data item to display in this row
 * @property {ListTableColumn<TItem>[]} columns - Array of column definitions to render data cells
 * @property {() => void} [onPress] - Optional callback when the row is pressed
 * @property {React.ReactNode} [action] - Optional action element to display at the end of the row (e.g., edit button)
 * @property {string} [className] - Optional additional CSS classes for the row container
 */
export type ListTableRowProps<TItem> = {
  item: TItem;
  columns: ListTableColumn<TItem>[];
  onPress?: () => void;
  action?: React.ReactNode;
  className?: string;
};
