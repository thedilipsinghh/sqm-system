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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  // Ensure cookies are sent with requests
  credentials: "include",
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (typeof window !== "undefined") {
      if (result.data) {
        const data = result.data as any;
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
      }

      if (result.error && result.error.status === 401) {
        const url = typeof args === "string" ? args : args.url;
        if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
          localStorage.removeItem("token");
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
            const currentPath = window.location.pathname + window.location.search;
            if (!window.location.search.includes("reason=expired")) {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=expired`;
            }
          }
        }
      }
    }

    return result;
  },
  tagTypes: ["User", "Counter", "Token", "Dashboard"],
  endpoints: () => ({}),
});
