import { createSlice } from "@reduxjs/toolkit";
import { themes } from "styles";

const initialState = {
  balance: "sdsdsd",
  headerText: "PayAiro Balance",
  accountText: "Securities Account",
  theme: {
    backgroundColor: themes.light.colors.palette.white,
    inverseBackgroundColor: themes.light.colors.palette.green700,
    textColor: themes.light.colors.palette.white,
  },
};

const animationSlice = createSlice({
  name: "animationSlice",
  initialState: {
    ...initialState,
  },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setHeaderText: (state, action) => {
      state.headerText = action.payload;
    },
    setAccountText: (state, action) => {
      state.accountText = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    resetState: () => initialState,
  },
});
export const {
  setBalance,
  setHeaderText,
  setAccountText,
  setTheme,
  resetState,
} = animationSlice.actions;

export default animationSlice.reducer;
