import { useEffect, useState } from "react";

import { Buffer } from "buffer";

import apiClient from "../utils/apiClient";

interface UserProfile {
  username: string;
  email: string;
  initials: string;
  name: string;
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        //const response = await apiClient.get("/profile");

        const response = await apiClient.get("/profile", {
          validateStatus: (status) => status < 500, // Only throw errors for 500+ status codes
        });

        setUserProfile(response.data.data);
      } catch (err: any) {
        setError(err.code || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const resetPassword = async (oldPassword: string, newPassword: string): Promise<string> => {
    const payload = {
      oldPassword: Buffer.from(oldPassword).toString("base64"),
      newPassword: Buffer.from(newPassword).toString("base64"),
    };

    try {
      const response = await apiClient.put("/profile/reset", payload, {
        validateStatus: (status) => status < 500, // Only throw errors for 500+ status codes
      });
      return response.status === 200 ? "success" : response.data.message;
    } catch {
      return "Something went wrong on our end. Please contact support";
    }
  };
  return { userProfile, isLoading, error, resetPassword };
}
