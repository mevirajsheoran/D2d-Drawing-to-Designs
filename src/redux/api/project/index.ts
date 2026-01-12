import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types
interface AutosaveProjectRequest {
  projectId: string;
  sketchesData?: any;
  viewportData?: any;
  styleGuide?: any;
  moodBoardImages?: string[];
}

interface AutosaveProjectResponse {
  success: boolean;
  message: string;
  eventId?: string;
}

// Project API
export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/project" }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    autosaveProject: builder.mutation<
      AutosaveProjectResponse,
      AutosaveProjectRequest
    >({
      query: (data) => ({
        url: "",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

export const { useAutosaveProjectMutation } = projectApi;