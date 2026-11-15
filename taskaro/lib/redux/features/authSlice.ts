import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { googleLoginUser, loginUser, registerUser } from "./authActions";
import toast from "react-hot-toast";
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
        toast.success("Login successful!");
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
        toast.success("Google Login successful!");
      })
      .addCase(googleLoginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload) toast.error(String(action.payload));
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
        toast.success("Registration successful!");
      })
      .addCase(registerUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice;

export const { setUser, logout } = authSlice.actions;

export const useAuth = () => {
  const { isAuthenticated, user, loading, error } = useSelector(
    (state: any) => state.reducer.auth
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const setLogin = (payload: any) => {
    dispatch(loginUser(payload) as any);
  };

  const setGoogleLogin = (payload?: any) => {
    dispatch(googleLoginUser(payload) as any);
  };

  const setCreateUser = (payload: any) => {
    dispatch(registerUser(payload) as any);
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
          toast.error("Session expired!");
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
    isAuthenticated,
    setGoogleLogin,
    setCreateUser,
    fetchUser,
  };
};

