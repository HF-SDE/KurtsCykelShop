import { createContext, useContext } from "react";

import { User } from "@/types/users/User";

import { useData } from "@hooks/useData";

export type UserWithRoles = User & {
  roles?: {
    id: string;
    name: string;
  }[];
};

export const UsersContext = createContext<{
  data: UserWithRoles[];
  setData: (data: UserWithRoles[]) => void;
  isLoading: boolean;
}>({
  data: [],
  setData: () => {},
  isLoading: false,
});

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
