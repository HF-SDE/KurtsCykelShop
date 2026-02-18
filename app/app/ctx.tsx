import React from "react";

import apiClient from "@/utils/apiClient";

import { useStorageState } from "@hooks/useStorageState";
import { Buffer } from "buffer";

const AuthContext = React.createContext<{
  signIn: (username: string, password: string) => Promise<string>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async () => "false",
  signOut: async () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export default function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, token], setToken] = useStorageState("token");
  return (
    <AuthContext.Provider
      value={{
        signIn: async (username, password) => {
          try {
            const isUsernameValid = username.trim() !== "";
            const isPasswordValid = password.trim() !== "";

            if (!isUsernameValid || !isPasswordValid) {
              setToken(null);
              return "Please fill out username and password";
            }

            const encodedPassword = Buffer.from(password).toString("base64");

            const loginData = {
              username: username,
              password: encodedPassword,
            };
            //setSession("null")

            const response = await apiClient.post("/login", loginData, {
              headers: { "Content-Type": "application/json" },
              timeout: 5000, // Timeout in milliseconds (e.g., 10 seconds)
              validateStatus: (status) => status < 500, // Only throw errors for 500+ status codes
            });

            if (!response) throw new Error("No response");
            if (response.status !== 200) return response.data.message;

            const result = response.data;

            if (
              !result ||
              !result.data ||
              !result.data.accessToken ||
              !result.data.accessToken.token
            ) {
              throw new Error("No token found in response");
            }

            setToken(result.data.accessToken.token);
            return "authenticated";
          } catch (error) {
            setToken(null);
            return "Something went wrong on our end. Please contact support";
          }
        },
        signOut: async () => {
          try {
            const logoutData = { token: token };

            apiClient.post("/logout", logoutData, {
              headers: { "Content-Type": "application/json" },
              validateStatus: (status) => status < 500, // Only throw errors for 500+ status codes
            });
          } catch (error) {
            //console.error(error);
          }
          setToken(null);
        },
        session: token,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
