import { createAsyncThunk } from "@reduxjs/toolkit";
import { signIn, getSession } from "next-auth/react";
import { Api } from "@/lib/api";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, { rejectWithValue }) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Prevent auto redirection
      });

      if (result?.error) {        
        if (result.error === "CredentialsSignin") {
          return rejectWithValue("Invalid credentials");
        } else {
          return rejectWithValue("Something went wrong ! try again later");
        }
      }

      const session = await getSession();
      if (session?.user) {
        return {
          user: session.user,
        };
      }
    } catch (error) {
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

// Async action for user registration using Api instance
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await Api.post("/auth/register", formData); // Using Api instance

      return response.data; // Assuming API returns { message: "Success" }
    } catch (error) {
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
      const result = await signIn("google");

      if (!result) {
        return rejectWithValue(
          "Google authentication is taking longer than expected. Please wait!"
        );
      }

      if (result.error) {
        console.log("session error", result.error);
        return rejectWithValue(result.error);
      }

      // Wait for session to be available
      let session = await getSession();

      // console.log("session data", session);

      //   let attempts = 0;
      //   while (!session?.user && attempts < 10) {
      //     await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
      //     session = await getSession();
      //     attempts++;
      //   }

      //   if (!session?.user) {
      //     return rejectWithValue("Session not found. Please try again.");
      //   }

      return {
        user: session.user,
      };
    } catch (error) {
      return rejectWithValue("Google login failed. Please try again.");
    }
  }
);
