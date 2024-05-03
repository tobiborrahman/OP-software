import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading, setTableLoading } from '../../../app/layout/loadingSlice';
import agent from '../../../app/api/agent';
import toast from 'react-hot-toast';
import CommonCard from '../../../app/components/CommonCard';
import CommonTable from '../../../app/components/CommonTable';
import { ColumnDef } from '@tanstack/react-table';
import { MetaData } from '../../../app/models/pagination';
import CustomInput from '../../../app/components/CustomInput';
import { Col, Row } from 'react-bootstrap';
import useDebounce from '../../../app/utils/useDebounce';
import { useAppSelector } from '../../../app/store/configureStore';
import { selectCurrentFinancialYear } from '../FinancialYear/financialYearSlice';
import FormNavigator from '../../../app/components/FormNavigator';
import { getAccessIdOrRedirect } from '../Company/CompanyInformation';
import { CommonModal } from '../../../app/components/Components';
import AccountForm from './AccountForm';

interface Account {
    accountID: string;
    accountName: string;
    accountGroupName: string;
    gstNo: string;
    mobileNumber: string;
    completeAddress: string;
    openingBalance: number;
}

const AccountList = () => {
    const accessId = getAccessIdOrRedirect();
    const dispatch = useDispatch();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();

    const [pagination, setPagination] = useState<MetaData>({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
    });
    const [searchTerm, setSearchTerm] = useState<string>('');
    const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

    const getAllAccounts = async (search: string = '') => {
        dispatch(setTableLoading(true));
        try {
            const response = await agent.Account.getAllAccounts(accessId, {
                pageNumber: pagination.currentPage,
                pageSize: pagination.pageSize,
                search,
            });
            setAccounts(response.items);
            setPagination(prev => ({
                ...prev,
                totalPages: response.metaData.totalPages,
                totalCount: response.metaData.totalCount,
            }));
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Error fetching accounts');
        } finally {
            dispatch(setTableLoading(false));
        }
    };

    useEffect(() => {
        getAllAccounts(debouncedSearchTerm);
    }, [debouncedSearchTerm, pagination.currentPage, pagination.pageSize]);

    const handleEdit = (row: any) => {
        //navigate(`/account/edit/${row.accountID}`);
        setSelectedAccountId(row.accountID);
        setShowAccountModal(true);
    };

    const handleDelete = async (account: any) => {

        if (window.confirm(`Are you sure you want to delete the account: ${account.accountName}?`)) {

            if (!accessId || !financialYear)
                return;

            dispatch(setLoading(true));
            try {
                await agent.Account.deleteAccount(accessId, account.accountID, financialYear?.financialYearFrom.toString());
                setAccounts(prevAccounts => prevAccounts.filter(a => a.accountID !== account.accountID));
                toast.success(`Account "${account.accountName}" deleted successfully.`);
            } catch (error) {
                console.error('Error deleting account:', error);
                toast.error(`Failed to delete account "${account.accountName}".`);
            } finally {
                dispatch(setLoading(false));
            }
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);

    };


    const columns: ColumnDef<any>[] = [
        {
            accessorFn: row => row.accountName,
            id: 'accountName',
            header: 'Account Name',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.accountGroupName,
            id: 'AccountGroupName',
            header: 'Group',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.gstNo,
            id: 'gstNo',
            header: 'GST No',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.mobileNumber,
            id: 'mobileNumber',
            header: 'Mobile No',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.completeAddress,
            id: 'CompleteAddress',
            header: 'Address',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.openingBalance,
            id: 'OpeningBalance',
            header: 'Opening Balance',
            cell: info => info.getValue(),

        },
        // Add more columns as needed
    ];
    return (
        <>
            <CommonCard header="Accounts List" size='100%'>
                <FormNavigator>
                    <Row>
                        <Col xs={12} className='mb-2'>
                            <CustomInput
                                autoFocus={true}
                                name="search"
                                label="Search by Name, Group, GSTNo, Mobile, Address, City, State..."
                                onChange={handleSearchChange}
                            />
                        </Col>
                    </Row>
                    <div className='mt-2'>
                        <CommonTable
                            data={accounts}
                            columns={columns}
                            onDelete={handleDelete}
                            showSrNo={true}
                            usePagination={true}
                            metaData={pagination}
                            onPageChange={(page: number) => setPagination((prev) => ({ ...prev, currentPage: page }))}
                            onRowClick={handleEdit}
                        />
                    </div>
                </FormNavigator>
            </CommonCard>

            <CommonModal show={showAccountModal} onHide={() => { setShowAccountModal(false); }} size='xl'>
                {selectedAccountId && (
                    <AccountForm
                        accountId={selectedAccountId}
                        isModalOpen={showAccountModal}
                        onCloseModalAfterSave={() => {
                            getAllAccounts(debouncedSearchTerm);
                            setShowAccountModal(false);
                        }}
                    />
                )}

            </CommonModal>
        </>

    );
};

export default AccountList;
