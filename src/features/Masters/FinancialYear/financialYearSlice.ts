import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../../app/api/agent";
import { FinancialYearDto } from "./financialYearDto";
import { RootState } from "../../../app/store/configureStore";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";

interface FinancialYearState {
  currentFinancialYear: FinancialYearDto | null;
}

const initialState: FinancialYearState = {
  currentFinancialYear: sessionStorage.getItem("currentFinancialYear")
    ? JSON.parse(sessionStorage.getItem("currentFinancialYear")!)
    : null,
};

const fetchCurrentFinancialYear = async (accessId: string) => {
  try {
    const financialYear = await agent.FinancialYear.getCurrentFinancialYear(
      accessId
    );
    if (financialYear) {
      sessionStorage.setItem(
        "currentFinancialYear",
        JSON.stringify(financialYear)
      );
      console.log(financialYear);

      return financialYear;
    } else {
      throw new Error("No financial year found");
    }
  } catch (error) {
    throw error;
  }
};

// Async thunk to fetch the financial year
export const getCurrentFinancialYear =
  createAsyncThunk<FinancialYearDto | null>(
    "financialYear/fetch",
    async (_, thunkAPI) => {
      try {
        const accessId = getAccessIdOrRedirect();
        return await fetchCurrentFinancialYear(accessId);
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  );

// Async thunk to update and fetch the current financial year
export const updateAndFetchCurrentFinancialYear = createAsyncThunk(
  "financialYear/updateAndFetch",
  async (newFinancialYear: Date, thunkAPI) => {
    try {
      const accessId = getAccessIdOrRedirect();
      await agent.FinancialYear.updateCurrentFinancialYear(
        accessId,
        newFinancialYear
      );
      return await fetchCurrentFinancialYear(accessId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);


// The slice
export const financialYearSlice = createSlice({
  name: "financialYear",
  initialState,
  reducers: {
    setCurrentFinancialYear: (state, action) => {
      state.currentFinancialYear = action.payload;
      sessionStorage.setItem(
        "currentFinancialYear",
        JSON.stringify(action.payload)
      );
    },
    clearCurrentFinancialYear: (state) => {
      state.currentFinancialYear = null;
      sessionStorage.removeItem("currentFinancialYear");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentFinancialYear.fulfilled, (state, action) => {
        state.currentFinancialYear = action.payload;
        console.log(action.payload);
      })
      .addCase(getCurrentFinancialYear.rejected, (state) => {
        state.currentFinancialYear = null;
      })
      .addCase(
        updateAndFetchCurrentFinancialYear.fulfilled,
        (state, action) => {
          state.currentFinancialYear = action.payload;
        }
      );
  },
});

export const { setCurrentFinancialYear, clearCurrentFinancialYear } =
  financialYearSlice.actions;
export default financialYearSlice.reducer;

export const selectCurrentFinancialYear = (
  state: RootState
): FinancialYearDto | null => state.financialYear.currentFinancialYear;
