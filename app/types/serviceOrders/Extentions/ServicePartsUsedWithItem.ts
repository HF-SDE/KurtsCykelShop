import { Item } from "@/types/Inventory/Item";

import { ServicePartsUsed } from "../ServicePartsUsed";

export interface ServicePartsUsedWithItem extends ServicePartsUsed {
  item: Item;
}
