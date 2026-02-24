import { getStorageItemAsync, setStorageItemAsync } from "@hooks/useStorageState";
import axios from "axios";
import { router } from "expo-router";

// Set up the proxy agent
const baseURL = process.env.EXPO_PUBLIC_API_URL;
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});
const localApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});

// Axios request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Skip adding Authorization header for token refresh requests
      if (config.url === "/refreshToken" || config.url === "/accessToken") {
        return config;
      }

      // Set the Authorization header before the request is sent
      const authHeader = await getAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
    } catch (error) {
      await setStorageItemAsync("token", null);
      router.replace("/login");
    }

    return config;
  },
  (error) => {
    // Handle errors in request setup
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    try {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        const originalRequest = error.config; // The original request that caused the error

        // If we haven't already tried to refresh the token
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          const authHeader = await getAuthHeader();
          if (authHeader) {
            originalRequest.headers["Authorization"] = authHeader;
          }
        }

        // If refresh failed, log out the user and clear the token
        await setStorageItemAsync("token", null);
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error during response handling:", error);
    }

    return Promise.reject(error);
  },
);

// Function to set the Authorization header
async function getAuthHeader(): Promise<string | undefined> {
  let token = await getStorageItemAsync("token");

  if (token) {
    if (isTokenExpired(token)) {
      const newToken = await getNewAccessToken(token); // Await the token
      return getAuthHeaderFormat(newToken);
    } else {
      return getAuthHeaderFormat(token);
    }
  } else {
    return undefined;
  }
}

// Function to check if the access token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    // Split the token to get the payload
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    // Check if the `exp` field exists
    if (!decodedPayload.exp) {
      throw new Error("Token does not have an exp field");
    }

    // Compare `exp` with the current time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedPayload.exp < currentTime;
  } catch (error) {
    return true; // Treat as expired if token is invalid
  }
};

const getNewAccessToken = async (expiredToken: string): Promise<string | undefined> => {
  try {
    // Step 1: Call /refreshToken with the expired token in the Authorization header
    const refreshResponse = await localApiClient.get("/refreshToken", {
      headers: {
        Authorization: getAuthHeaderFormat(expiredToken),
      },
    });

    // Check if the response contains the refresh token
    const refreshToken = refreshResponse.data?.data?.refreshToken?.token;
    if (!refreshToken) {
      throw new Error("Failed to retrieve refresh token");
    }

    // Step 2: Call /accessToken with the refresh token in the body
    const accessResponse = await localApiClient.post("/accessToken", {
      token: refreshToken,
    });

    // Check if the response contains the access token
    const accessToken = accessResponse.data?.data?.accessToken?.token;
    if (!accessToken) {
      throw new Error("Failed to retrieve access token");
    }

    // Step 3: Save the new access token using setStorageItemAsync
    await setStorageItemAsync("token", accessToken);

    // Step 4: Return the new access token
    return accessToken;
  } catch (error) {
    throw new Error("Error while refreshing access token");
  }
};

const getAuthHeaderFormat = (token: string | undefined): string | undefined => {
  return token ? `Bearer ${token}` : undefined;
};

export default apiClient;
