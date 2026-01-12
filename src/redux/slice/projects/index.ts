import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Project summary type (for list display)
export interface ProjectSummary {
  id: string;
  name: string;
  projectNumber: number;
  thumbnail: string | null;
  lastModified: number;
  createdAt: number;
}

// Full project type
export interface Project extends ProjectSummary {
  description?: string;
  styleGuide?: string;
  sketchesData?: any;
  viewportData?: any;
  generatedDesignData?: any;
  moodBoardImages?: string[];
  inspirationImages?: string[];
  tags?: string[];
  isPublic?: boolean;
}

// Projects state
interface ProjectsState {
  projects: ProjectSummary[];
  currentProject: Project | null;
  total: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  isCreating: boolean;
  createError: string | null;
  isSaving: boolean;
  lastSaved: number | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  total: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
  isCreating: false,
  createError: null,
  isSaving: false,
  lastSaved: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    // Fetch actions
    fetchProjectsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (
      state,
      action: PayloadAction<{ projects: ProjectSummary[]; total: number }>
    ) => {
      state.isLoading = false;
      state.projects = action.payload.projects;
      state.total = action.payload.total;
      state.lastFetched = Date.now();
      state.error = null;
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Create actions
    createProjectStart: (state) => {
      state.isCreating = true;
      state.createError = null;
    },
    createProjectSuccess: (state) => {
      state.isCreating = false;
      state.createError = null;
    },
    createProjectFailure: (state, action: PayloadAction<string>) => {
      state.isCreating = false;
      state.createError = action.payload;
    },

    // Save actions
    saveProjectStart: (state) => {
      state.isSaving = true;
    },
    saveProjectSuccess: (state) => {
      state.isSaving = false;
      state.lastSaved = Date.now();
    },
    saveProjectFailure: (state) => {
      state.isSaving = false;
    },

    // Current project
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },

    // Project management
    addProject: (state, action: PayloadAction<ProjectSummary>) => {
      state.projects.unshift(action.payload);
      state.total += 1;
    },
    updateProject: (
      state,
      action: PayloadAction<Partial<ProjectSummary> & { id: string }>
    ) => {
      const index = state.projects.findIndex(
        (project) => project.id === action.payload.id
      );
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          ...action.payload,
        };
      }
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(
        (project) => project.id !== action.payload
      );
      state.total -= 1;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.total = 0;
      state.lastFetched = null;
      state.currentProject = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  saveProjectStart,
  saveProjectSuccess,
  saveProjectFailure,
  setCurrentProject,
  addProject,
  updateProject,
  removeProject,
  clearProjects,
  clearErrors,
} = projectsSlice.actions;

export default projectsSlice.reducer;