import { configureStore } from "@reduxjs/toolkit";
import { accountSlice } from "../../features/UserAccount/accountSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import loadingSlice from "../layout/loadingSlice";
import financialYearSlice from "../../features/Masters/FinancialYear/financialYearSlice";

export const store = configureStore({
  reducer: {
    account: accountSlice.reducer,
    loading: loadingSlice,
    financialYear: financialYearSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
