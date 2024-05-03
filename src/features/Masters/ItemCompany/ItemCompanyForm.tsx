import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Col, Row } from "react-bootstrap";
import agent from "../../../app/api/agent";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";

import { CommonCard, CommonTable, CustomButton, CustomInput, FormNavigator } from "../../../app/components/Components";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";

function ItemCompanyForm() {
    const { register, handleSubmit, setValue, setFocus, formState: { isSubmitting, isValid }, reset } = useForm<ItemCompanyDto>();
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [itemCompanies, setItemCompanies] = useState<ItemCompanyDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItemCompany, setEditingItemCompany] = useState<ItemCompanyDto | null>(null);

    const columns: ColumnDef<ItemCompanyDto>[] = [
        {
            accessorFn: row => row.itemCompanyName,
            id: 'itemCompanyName',
            header: 'Company Name',
            cell: info => info.getValue(),
        },
        
    ];

    const getAllItemCompanies = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedItemCompanies = await agent.ItemCompany.getAllItemCompanies(accessId);
            setItemCompanies(fetchedItemCompanies);
        } catch (error) {
            console.error("Error fetching item companies", error);
            toast.error("Error fetching item companies");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllItemCompanies();
    }, [dispatch]);

    const onSubmit = async (data: ItemCompanyDto) => {
        dispatch(setLoading(true));
        try {
            if (accessId) {
                if (editingItemCompany && editingItemCompany.itemCompanyID !== undefined) {
                    await agent.ItemCompany.updateItemCompany(accessId, editingItemCompany.itemCompanyID, data);
                    toast.success('Item Company updated successfully');
                } else {
                    await agent.ItemCompany.createItemCompany(accessId, data);
                    toast.success('Item Company created successfully');
                }
                getAllItemCompanies();
            }
        } catch (error: any) {
            handleApiErrors(error); // Make sure this is adapted to handle your API's error structure
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingItemCompany(null);
            reset();
            setFocus('itemCompanyName');
        }
    };

    const handleEdit = (row: ItemCompanyDto) => {
        setEditingItemCompany(row);
        setIsEditMode(true);
        setValue('itemCompanyName', row.itemCompanyName);
        setValue('itemCompanyID', row.itemCompanyID);
        setFocus('itemCompanyName');
    };

    const handleDelete = async (row: ItemCompanyDto) => {
        if (row.itemCompanyID === undefined) {
            toast.error('Error: Invalid item company ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the item company "${row.itemCompanyName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.ItemCompany.deleteItemCompany(accessId, row.itemCompanyID);
                toast.success(`Item Company "${row.itemCompanyName}" deleted successfully`);
                getAllItemCompanies();
            } catch (error) {
                console.error('Error deleting item company:', error);
                toast.error('Error deleting item company');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingItemCompany(null);
                reset();
                setFocus('itemCompanyName');
            }
        }
    };

    return (
        <CommonCard header='Item Company'>
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={10}>
                        <CustomInput
                            autoFocus
                            label="Item Company Name"
                            name='itemCompanyName'
                            register={register}
                            validationRules={{ required: 'Item ompany Name cannot be empty.' }}
                        />
                    </Col>
                    <Col xs={2} className="d-flex align-items-end mb-2">
                        <CustomButton
                            text={isEditMode ? 'Update' : 'Save'} variant="primary" type="submit"
                            isSubmitting={isSubmitting}
                            isValid={isValid}
                            showAtEnd
                        />
                    </Col>
                </Row>
            </FormNavigator>
            <CommonTable
                data={itemCompanies}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showSrNo
            />
        </CommonCard>
    );
}

export default ItemCompanyForm;
