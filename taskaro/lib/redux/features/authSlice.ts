import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { googleLoginUser, loginUser, registerUser } from "./authActions";
import { protectedApiGet } from "@/lib/api";

export interface UserState {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
  about?: string;
  [key: string]: any;
}

interface AuthState {
  user: UserState | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload?.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload?.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLoginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice;

export const { setUser, logout, clearError } = authSlice.actions;

export const useAuth = () => {
  const { isAuthenticated, user, loading, error } = useSelector(
    (state: any) => state.reducer.auth
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const setLogin = (payload: any) => {
    return dispatch(loginUser(payload) as any);
  };

  const setGoogleLogin = (payload?: any) => {
    return dispatch(googleLoginUser(payload) as any);
  };

  const setCreateUser = (payload: any) => {
    return dispatch(registerUser(payload) as any);
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const logoutUser = () => {
    dispatch(logout());
    router.push("/auth/login");
  };

  const fetchUser = () => {
    protectedApiGet("/secure/fetch-me")
      .then(({ data }) => {
        dispatch(setUser(data));
      })
      .catch((err) => {
        if (
          err.response?.status === 401 &&
          err?.response?.data?.error === "Token has expired"
        ) {
          logoutUser();
          dispatch(logout());
        }
      });
  };

  return {
    setLogin,
    logoutUser,
    user,
    loading,
    error,
    clearAuthError,
    isAuthenticated,
    setGoogleLogin,
    setCreateUser,
    fetchUser,
  };
};
