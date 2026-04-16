import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  user: {},
  error: "", // for error message
  loading: false,
  isUserLogout: false,
  errorMsg: false, // for error
};

const loginSlice  = createSlice({
  name: "login",
  initialState,
  reducers: {
    apiError(state, action) {
      // Handle different error payload formats
      if (typeof action.payload === 'string') {
        state.error = action.payload;
      } else if (action.payload?.message) {
        state.error = action.payload.message;
      } else if (action.payload?.data) {
        state.error = action.payload.data;
      } else if (action.payload?.error) {
        state.error = action.payload.error;
      } else {
        state.error = "An error occurred";
      }
      state.loading = false;
      state.isUserLogout = false;
      state.errorMsg = true;
    },
    loginSuccess(state, action) {
      state.user = action.payload
      state.loading = false;
      state.errorMsg = false;
      state.error = "";
      state.isUserLogout = false;
    },
    logoutUserSuccess(state, action) {
      state.isUserLogout = true
    },
    reset_login_flag(state) {
      state.error = "";
      state.loading = false;
      state.errorMsg = false;
    }
  },
});

export const {
  apiError,
  loginSuccess,
  logoutUserSuccess,
  reset_login_flag
} = loginSlice.actions

export default loginSlice.reducer;