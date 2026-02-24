import React from "react";

export type ListTableColumn<TItem> = {
  key: Extract<keyof TItem, string>;
  header?: string;
  flexClassName?: string;
};

export type ListTableHeaderProps<TItem> = {
  columns: ListTableColumn<TItem>[];
  className?: string;
  action?: React.ReactNode;
};

export type ListTableRowProps<TItem> = {
  item: TItem;
  columns: ListTableColumn<TItem>[];
  onPress?: () => void;
  action?: React.ReactNode;
  className?: string;
};
