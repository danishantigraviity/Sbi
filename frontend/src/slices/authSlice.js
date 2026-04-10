import { createSlice } from "@reduxjs/toolkit";

let storedUser = null;
let storedToken = null;

try {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (user && user !== "undefined") storedUser = JSON.parse(user);
  if (token && token !== "undefined") storedToken = token;
} catch (error) {
  console.error("Failed to parse stored auth data:", error);
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

const initialState = {
  user: storedUser || null,
  token: storedToken || null,
  isAuthenticated: !!(storedUser && storedToken),
};

const syncToLocalStorage = (user, token) => {
  try {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
  } catch (error) {
    console.error("Failed to sync auth data to localStorage:", error);
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      syncToLocalStorage(action.payload.user, action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setWorkMode: (state, action) => {
      if (state.user) {
        state.user.workMode = action.payload;
        syncToLocalStorage(state.user, state.token);
      }
    },
  },
});

export const { loginSuccess, logout, setWorkMode } = authSlice.actions;
export default authSlice.reducer;
