import { createAsyncThunk } from "@reduxjs/toolkit";
import { signIn, getSession } from "next-auth/react";
import { Api } from "@/lib/api";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          return rejectWithValue("Invalid credentials");
        } else {
          return rejectWithValue("Something went wrong! Try again later");
        }
      }

      const session = await getSession();
      if (session?.user) {
        return {
          user: session.user,
        };
      }
      return rejectWithValue("Session could not be retrieved");
    } catch {
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

// Async action for user registration using Api instance
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await Api.post("/auth/register", formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    }
  }
);

// Async thunk for Google login
export const googleLoginUser = createAsyncThunk(
  "auth/googleLoginUser",
  async (_, { rejectWithValue }) => {
    try {
      const result = (await signIn("google")) as any;

      if (!result) {
        return rejectWithValue(
          "Google authentication is taking longer than expected. Please wait!"
        );
      }

      if (result.error) {
        return rejectWithValue(result.error);
      }

      const session = await getSession();
      if (!session?.user) {
        return rejectWithValue("Session not found. Please try again.");
      }

      return {
        user: session.user,
      };
    } catch {
      return rejectWithValue("Google login failed. Please try again.");
    }
  }
);
