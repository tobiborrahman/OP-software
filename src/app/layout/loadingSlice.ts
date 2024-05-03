// src/features/loading/loadingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingState {
  isLoading: boolean;
  isTableLoading: boolean;
}

const initialState: LoadingState = {
  isLoading: false,
  isTableLoading: false,
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
  },
});

export const { setLoading, setTableLoading } = loadingSlice.actions;

export const selectTableLoading = (state: { loading: LoadingState }) =>
  state.loading.isTableLoading;

export const selectLoading = (state: { loading: LoadingState }) =>
  state.loading.isLoading;

export default loadingSlice.reducer;
