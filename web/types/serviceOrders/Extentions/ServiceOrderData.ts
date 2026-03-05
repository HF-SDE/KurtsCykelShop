import { Customer } from "@/types/customers/Customer";
import { User } from "@/types/users/User";

import { ServiceOrder } from "../ServiceOrder";
import { ServicePartsUsed } from "../ServicePartsUsed";
import { ServiceRepair } from "../ServiceRepair";
import { ServicePartsUsedWithItem } from "./ServicePartsUsedWithItem";

export interface ServiceOrderData extends ServiceOrder {
  customer: Customer;
  assignedTo: User;
  servicePartsUsedWithItem: ServicePartsUsedWithItem[];
  serviceRepairs: ServiceRepair[];
  assignedBy: User;
}
