import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FieldValues } from "react-hook-form";
import agent from "../../app/api/agent";
import { User } from "../../app/models/user";
import toast from "react-hot-toast";
import { deleteStoredCompanyInformation } from "../Masters/Company/CompanyInformation";

interface AccountState {
  user: User | null;
}

const initialState: AccountState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
};

export const signInUser = createAsyncThunk<User, FieldValues>(
  "account/signInUser",
  async (data, thunkAPI) => {
    try {
      const user = await agent.UserAccount.login(data);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user)); // Store user in local storage only if not null
        return user;
      } else {
        toast.error("Login failed");
        return thunkAPI.rejectWithValue(
          new Error("Login failed, user is null")
        );
      }
    } catch (error) {
      toast.error("Failed to sign in");
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<User>(
  "account/currentUser",
  async (_, thunkAPI) => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user;
      } catch (error) {
        localStorage.removeItem("user");
        deleteStoredCompanyInformation();

        return thunkAPI.rejectWithValue(
          new Error("Failed to parse stored user data.")
        );
      }
    } else {
      try {
        // If there's no user in local storage, fetch from the server
        const fetchedUser = await agent.UserAccount.currentUser();
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        deleteStoredCompanyInformation();
        return fetchedUser;
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  }
);

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    signOut: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      deleteStoredCompanyInformation();
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(signInUser.rejected, (state) => {
        state.user = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
      });
  },
});

export const { signOut, setUser } = accountSlice.actions;
