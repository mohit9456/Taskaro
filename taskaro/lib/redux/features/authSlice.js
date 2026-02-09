import { createSlice } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { googleLoginUser, loginUser, registerUser } from "./authActions";
import toast from "react-hot-toast";
import { protectedApiGet } from "@/lib/api";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
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
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        toast.success("Login successful!");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(googleLoginUser.pending, (state) => {
        console.log("Google Login pending"); // Debugging ke liye
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        console.log("Google Login Payload:", action.payload); // Debugging ke liye
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        toast.success("Google Login successful!");
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        console.log("Google Login rejected:", action.payload); // Debugging ke liye
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        toast.success("Registration successful!");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice;

export const { setUser, logout } = authSlice.actions;

export const useAuth = () => {
  const { isAuthenticated, user, loading, error } = useSelector(
    (state) => state.reducer.auth
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const setLogin = (payload) => {
    dispatch(loginUser(payload));
  };

  const setGoogleLogin = (payload) => {
    dispatch(googleLoginUser(payload));
  };

  const setCreateUser = (payload) => {
    dispatch(registerUser(payload));
  };

  const logoutUser = () => {
    dispatch(logout());
    router.push("/auth/login");
  };

  /**fetch authenticated user */
  const fetchUser = () => {
    protectedApiGet("/secure/fetch-me")
      .then(({ data }) => {
        console.log(data, "data");

        dispatch(setUser(data));
      })
      .catch((error) => {
        if (
          error.response?.status === 401 &&
          error?.response.data.error === "Token has expired"
        ) {
          console.log("Session Error", error);
          toast.error("Session expired!");
          logoutUser();
          dispatch(logout());
        }
        // else if(error?.message === "Network Error"){
        //   toast.error(error?.message);
        //   dispatch(logout())
        // }
        // else {
        //   toast.error(error.response);
        // }
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
