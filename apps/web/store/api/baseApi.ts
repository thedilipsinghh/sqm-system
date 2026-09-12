import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const rawUrl = isProduction
    ? process.env.NEXT_PUBLIC_API_URL
    : (process.env.LOCAL_URL || process.env.NEXT_PUBLIC_LOCAL_URL);

  if (!rawUrl) {
    throw new Error("API URL is not configured");
  }

  const cleanUrl = rawUrl.replace(/\/$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    // Ensure cookies are sent with requests
    credentials: "include",
  }),
  tagTypes: ["User", "Counter", "Token", "Dashboard"],
  endpoints: () => ({}),
});
