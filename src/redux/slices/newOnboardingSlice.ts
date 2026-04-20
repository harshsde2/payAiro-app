import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NewOnboardingState {
  stepCount: number;
  profileCompleted: boolean;
  addressCompleted: boolean;
}

const initialState: NewOnboardingState = {
  stepCount: 0,
  profileCompleted: false,
  addressCompleted: false,
};

const newOnboardingSlice = createSlice({
  name: "onboardingSlice",
  initialState,
  reducers: {
    setStepCount: (state, action: PayloadAction<number>) => {
      state.stepCount = action.payload;
    },
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      state.profileCompleted = action.payload;
    },
    setAddressCompleted: (state, action: PayloadAction<boolean>) => {
      state.addressCompleted = action.payload;
    },
    resetOnboardingState: () => initialState,
  },
});

export const {
  setStepCount,
  setProfileCompleted,
  setAddressCompleted,
  resetOnboardingState,
} = newOnboardingSlice.actions;

export default newOnboardingSlice.reducer;
