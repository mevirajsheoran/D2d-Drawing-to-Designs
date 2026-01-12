import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Profile } from "@/types/user";

interface ProfileState {
  user: Profile | null;
  isLoading: boolean;
}

const initialState: ProfileState = {
  user: null,
  isLoading: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    clearProfile: (state) => {
      state.user = null;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateProfileImage: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.image = action.payload;
      }
    },
    updateProfileName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.name = action.payload;
      }
    },
  },
});

export const {
  setProfile,
  clearProfile,
  setLoading,
  updateProfileImage,
  updateProfileName,
} = profileSlice.actions;

export default profileSlice.reducer;