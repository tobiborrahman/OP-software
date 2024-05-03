import { Suspense, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../../app/layout/loadingSlice';
import agent from '../../../app/api/agent';
import toast from 'react-hot-toast';
import CommonCard from '../../../app/components/CommonCard';
import CommonTable from '../../../app/components/CommonTable';
import { ColumnDef } from '@tanstack/react-table';
import { MetaData } from '../../../app/models/pagination';
import CustomInput from '../../../app/components/CustomInput';
import { Col, Row } from 'react-bootstrap';
import useDebounce from '../../../app/utils/useDebounce';
import { getAccessIdOrRedirect } from '../Company/CompanyInformation';
import FormNavigator from '../../../app/components/FormNavigator';
import { CommonModal } from '../../../app/components/Components';
import ItemForm from './ItemForm';

interface Item {
    itemID: number;
    itemName: string;
    itemCompany: string;
    itemGroup: string;
    hsnCode: string;
    gstSlab: string;
    stockQuantity: number;
}

const ItemList = () => {
    const accessId = getAccessIdOrRedirect();
    const dispatch = useDispatch();
    const [items, setItems] = useState<Item[]>([]);
    const [showItemModal, setShowItemModal] = useState<boolean>(false);
    const [selectedItemId, setSelectedItemId] = useState<number>();

    const [pagination, setPagination] = useState<MetaData>({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
    });
    const [searchTerm, setSearchTerm] = useState<string>('');
    const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

    const getAllItems = async (search: string = '') => {
        dispatch(setLoading(true));
        try {
            const response = await agent.Item.getAllItems(accessId, {
                pageNumber: pagination.currentPage,
                pageSize: pagination.pageSize,
                search,
            });
            setItems(response.items);
            setPagination(prev => ({
                ...prev,
                totalPages: response.metaData.totalPages,
                totalCount: response.metaData.totalCount,
            }));
        } catch (error) {
            toast.error('Error fetching items');
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllItems(debouncedSearchTerm);
    }, [debouncedSearchTerm, pagination.currentPage, pagination.pageSize]);

    const handleEdit = (row: Item) => {
        if (row.itemID) {
            setSelectedItemId(row.itemID);
            setShowItemModal(true);
        }
    };

    const handleDelete = async (item: Item) => {
        if (window.confirm(`Are you sure you want to delete the item: ${item.itemName}?`)) {
            dispatch(setLoading(true));
            try {
                await agent.Item.deleteItem(accessId, item.itemID);
                setItems(prevItems => prevItems.filter(i => i.itemID !== item.itemID));
                toast.success(`Item "${item.itemName}" deleted successfully.`);
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error(`Failed to delete item "${item.itemName}".`);
            } finally {
                dispatch(setLoading(false));
            }
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const columns: ColumnDef<Item>[] = [
        { accessorKey: 'itemName', header: 'Item Name' },
        { accessorKey: 'itemCompany', header: 'Company' },
        { accessorKey: 'itemCategory', header: 'Category' },
        { accessorKey: 'hsnCode', header: 'HSN Code' },
        { accessorKey: 'gstSlab', header: 'GST Slab' },
    ];

    return (
        <>
            <CommonCard header="Items List" size="100%">
                <FormNavigator>
                    <Row className='mb-2'>
                        <Col xs={12}>
                            <CustomInput
                                name="search"
                                placeholder="Search by Name, Company, Group, HSN Code, GST Slab..."
                                onChange={handleSearchChange}
                                autoFocus
                            />
                        </Col>
                    </Row>
                    <CommonTable
                        data={items}
                        columns={columns}
                        onDelete={handleDelete}
                        showSrNo={true}
                        usePagination={true}
                        metaData={pagination}
                        onPageChange={(page: number) => setPagination((prev) => ({ ...prev, currentPage: page }))}
                        onRowClick={handleEdit}
                    />
                </FormNavigator >
            </CommonCard>

            <CommonModal show={showItemModal} onHide={() => { setShowItemModal(false); }} size='xl'>
                <Suspense fallback={<div>Loading...</div>}>
                    {showItemModal && <ItemForm
                        isModalOpen={showItemModal}
                        itemID={selectedItemId}
                        onCloseModalAfterSave={async () => {
                            setShowItemModal(false);
                            getAllItems(debouncedSearchTerm);
                        }}
                    />}
                </Suspense>
            </CommonModal>

        </>
    );
};

export default ItemList;
