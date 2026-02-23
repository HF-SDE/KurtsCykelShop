import { Customer } from "@/types/customers/Customer";
import { User } from "@/types/users/User";

import { ServiceOrder } from "../ServiceOrder";
import { ServicePartsUsed } from "../ServicePartsUsed";
import { ServiceRepair } from "../ServiceRepair";

export interface ServiceOrderData extends ServiceOrder {
  customer: Customer;
  assignedTo: User;
  servicePartsUsed: ServicePartsUsed[];
  serviceRepairs: ServiceRepair[];
}
