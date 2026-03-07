import axios from "axios";

console.log("BACKEND_URL:", process.env.BACKEND_URL);

export const apiClient = axios.create({
  baseURL: process.env.BACKEND_URL ?? "http://backend:5000",
});
