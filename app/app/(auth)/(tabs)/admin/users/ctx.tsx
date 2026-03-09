import { createContext, useContext } from "react";

import { User } from "@/types/users/User";

import { useData } from "@hooks/useData";

export type UserWithRoles = User & {
  roles?: {
    id: string;
    name: string;
  }[];
};

interface UsersContextValue {
  data: UserWithRoles[];
  setData: React.Dispatch<React.SetStateAction<UserWithRoles[]>>;
  isLoading: boolean;
}

export const UsersContext = createContext<UsersContextValue | undefined>(undefined);

export function useUsers() {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error("useUsers must be used within a <UsersProvider />");
  }

  return context;
}

export default function UsersProvider({ children }: { children: React.ReactNode }) {
  const [data, setData, isLoading] = useData<UserWithRoles>("/manage/user", []);

  return <UsersContext.Provider value={{ data, setData, isLoading }}>{children}</UsersContext.Provider>;
}
