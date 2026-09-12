import { baseApi } from "./baseApi";

export const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateToken: builder.mutation({
      query: (body) => ({
        url: "/tokens",
        method: "POST",
        body,
      }),
      // Invalidates both Customer's token state and Counters so they refetch queue stats
      invalidatesTags: ["Token", "Counter", "Dashboard"],
    }),
    getCurrentCustomerToken: builder.query({
      query: () => "/tokens/current",
      providesTags: ["Token"],
    }),
    getCustomerHistory: builder.query({
      query: () => "/tokens/history",
      providesTags: ["Token"],
    }),
    getQueue: builder.query({
      query: (counterId) => `/tokens/counter/${counterId}/queue`,
      providesTags: ["Token"],
    }),
    callNextToken: builder.mutation({
      query: (counterId) => ({
        url: `/tokens/counter/${counterId}/next`,
        method: "POST",
      }),
      invalidatesTags: ["Token", "Counter", "Dashboard"],
    }),
    completeToken: builder.mutation({
      query: (tokenId) => ({
        url: `/tokens/${tokenId}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Token", "Counter", "Dashboard"],
    }),
    skipToken: builder.mutation({
      query: (tokenId) => ({
        url: `/tokens/${tokenId}/skip`,
        method: "POST",
      }),
      invalidatesTags: ["Token", "Counter", "Dashboard"],
    }),
    cancelToken: builder.mutation({
      query: (tokenId) => ({
        url: `/tokens/${tokenId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Token", "Counter", "Dashboard"],
    }),
  }),
});

export const {
  useGenerateTokenMutation,
  useGetCurrentCustomerTokenQuery,
  useGetCustomerHistoryQuery,
  useGetQueueQuery,
  useCallNextTokenMutation,
  useCompleteTokenMutation,
  useSkipTokenMutation,
  useCancelTokenMutation,
} = tokenApi;
