import { baseApi } from "./baseApi";

export const counterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCounters: builder.query({
      query: () => "/counters",
      providesTags: ["Counter"],
    }),
    createCounter: builder.mutation({
      query: (body) => ({
        url: "/counters",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Counter"],
    }),
    updateCounter: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/counters/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Counter"],
    }),
    deleteCounter: builder.mutation({
      query: (id) => ({
        url: `/counters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Counter"],
    }),
    activateCounter: builder.mutation({
      query: (id) => ({
        url: `/counters/${id}/activate`,
        method: "POST",
      }),
      invalidatesTags: ["Counter"],
    }),
    deactivateCounter: builder.mutation({
      query: (id) => ({
        url: `/counters/${id}/deactivate`,
        method: "POST",
      }),
      invalidatesTags: ["Counter"],
    }),
    pauseCounter: builder.mutation({
      query: (id) => ({
        url: `/counters/${id}/pause`,
        method: "POST",
      }),
      invalidatesTags: ["Counter"],
    }),
    resumeCounter: builder.mutation({
      query: (id) => ({
        url: `/counters/${id}/resume`,
        method: "POST",
      }),
      invalidatesTags: ["Counter"],
    }),
  }),
});

export const {
  useGetCountersQuery,
  useCreateCounterMutation,
  useUpdateCounterMutation,
  useDeleteCounterMutation,
  useActivateCounterMutation,
  useDeactivateCounterMutation,
  usePauseCounterMutation,
  useResumeCounterMutation,
} = counterApi;
