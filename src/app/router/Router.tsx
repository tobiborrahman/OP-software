import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../layout/App";
import Register from "../../features/UserAccount/Register";
import Login from "../../features/UserAccount/Login";
import Companies from "../../features/Masters/Company/SelectCompany";
import ServerError from "../errors/ServerError";
import NotFound from "../errors/NotFound";
import RequireAuth from "./RequireAuth";
import CreateCompany from "../../features/Masters/Company/CompanyForm";
import ForgotPassword from "../../features/UserAccount/ForgotPassword";
import ResetPassword from "../../features/UserAccount/ResetPassword";
import Dashboard from "../../features/Masters/Dashboard/Dashboard";
import FinancialYearForm from "../../features/Masters/FinancialYear/FinancialYearForm";
import AccountGroupForm from "../../features/Masters/AccountGroup/AccountGroupForm";
import CityForm from "../../features/Masters/City/CityForm";
import ItemUnitForm from "../../features/Masters/ItemUnit/ItemUnitForm";
import GSTSlabForm from "../../features/Masters/GSTSlab/GSTSlabForm";
import AccountForm from "../../features/Masters/Account/AccountForm";
import AccountList from "../../features/Masters/Account/AccountList";
import ItemCompanyForm from "../../features/Masters/ItemCompany/ItemCompanyForm";
import ItemCategoryForm from "../../features/Masters/ItemCategory/ItemCategoryForm";
import ItemGodownForm from "../../features/Masters/ItemGodown/ItemGodownForm";
import ItemForm from "../../features/Masters/Item/ItemForm";
import ItemList from "../../features/Masters/Item/ItemList";
import PaymentAndReceiptForm from "../../features/Vouchers/VoucherCommon/PaymentAndReceiptForm";
import JournalEntryForm from "../../features/Vouchers/JournalEntry/JournalEntryForm";
import BankEntryForm from "../../features/Vouchers/BankEntry/BankEntryForm";
import LedgerReport from "../../features/Reports/Ledger/LedgerReport";
import { VoucherTypeEnum } from "../../features/Vouchers/VoucherCommon/voucherTypeEnum";
import TrialBalanceReport from "../../features/Reports/TrialBalance/TrialBalanceReport";
import BillBookForm from "../../features/Masters/BillBook/SaleBillBookForm";
import { SalePurchaseForm } from "../../features/Vouchers/SalePurchase/SalePurchaseForm";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'reset-password', element: <ResetPassword /> },
            { path: 'forgot-password', element: <ForgotPassword /> },
            { path: 'server-error', element: <ServerError /> },
            { path: 'not-found', element: <NotFound /> },
            {
                path: '/',
                element: <RequireAuth />,
                children: [
                    { path: '/', element: <Navigate to="/select-company" replace /> },
                    { path: 'select-company', element: <Companies /> },
                    { path: 'create-company', element: <CreateCompany /> },
                    { path: 'edit-company', element: <CreateCompany /> },
                    { path: 'dashboard', element: <Dashboard /> },
                    { path: 'add-financial-year', element: <FinancialYearForm /> },
                    { path: 'edit-financial-year', element: <FinancialYearForm /> },
                    { path: 'account-group', element: <AccountGroupForm /> },
                    { path: 'city', element: <CityForm /> },
                    { path: 'item-unit', element: <ItemUnitForm /> },
                    { path: 'gst-slab', element: <GSTSlabForm /> },
                    { path: 'account', element: <AccountForm /> },
                    { path: 'account/edit/:accountId', element: <AccountForm /> },
                    { path: 'account-list', element: <AccountList /> },
                    { path: 'item-company', element: <ItemCompanyForm /> },
                    { path: 'item-category', element: <ItemCategoryForm /> },
                    { path: 'item-godown', element: <ItemGodownForm /> },
                    { path: 'item', element: <ItemForm /> },
                    { path: 'item-list', element: <ItemList /> },
                    { path: 'item/edit/:itemID', element: <ItemForm /> },
                    { path: 'Voucher/Payment', element: <PaymentAndReceiptForm voucherType={VoucherTypeEnum.Payment} /> },
                    { path: 'Voucher/Receipt', element: <PaymentAndReceiptForm voucherType={VoucherTypeEnum.Receipt} /> },
                    { path: 'Voucher/BankEntry', element: <BankEntryForm /> },
                    { path: 'Voucher/JournalEntry', element: <JournalEntryForm /> },
                    { path: 'Voucher/Sale', element: <SalePurchaseForm voucherType={VoucherTypeEnum.ItemSale} /> },
                    { path: 'Report/Ledger', element: <LedgerReport /> },
                    { path: 'Report/TrialBalance', element: <TrialBalanceReport /> },
                    { path: 'sale-billbook', element: <BillBookForm /> },
                ]
            },
            { path: '*', element: <Navigate replace to='/not-found' /> }
        ]
    }
]);
