import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import agent from "../../../app/api/agent";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";
import { CommonCard, CommonTable, CustomButton, CustomInput, FormNavigator } from "../../../app/components/Components";
import { Col, Row } from "react-bootstrap";
import { ColumnDef } from "@tanstack/react-table";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";


function ItemCategoryForm() {
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [itemCategories, setItemCategories] = useState<ItemCategoryDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItemCategory, setEditingItemCategory] = useState<ItemCategoryDto | null>(null);
    const { register, handleSubmit, setValue, setFocus, reset, formState: { errors, isSubmitting, isValid } } = useForm<ItemCategoryDto>();

    const columns: ColumnDef<ItemCategoryDto>[] = [
        {
            accessorFn: row => row.itemCategoryName,
            id: 'itemCategoryName',
            header: 'Category Name',
            cell: info => info.getValue(),
        },

    ];

    useEffect(() => {
        fetchItemCategories();
    }, [accessId]);

    const fetchItemCategories = async () => {
        dispatch(setLoading(true));
        try {
            const data = await agent.ItemCategory.getAllItemCategories(accessId);
            setItemCategories(data);
        } catch (error) {
            console.error("Error fetching item categories:", error);
            toast.error("Error fetching item categories");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const onSubmit = async (data: ItemCategoryDto) => {
        dispatch(setLoading(true));
        try {
            if (editingItemCategory?.itemCategoryID) {
                await agent.ItemCategory.updateItemCategory(accessId, editingItemCategory.itemCategoryID, data);
                toast.success('Item category updated successfully');
            } else {
                await agent.ItemCategory.createItemCategory(accessId, data);
                toast.success('Item category added successfully');
            }
            resetForm();
            fetchItemCategories();
        } catch (error) {
            console.error("Failed to submit item category:", error);
            toast.error("Failed to submit item category");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const resetForm = () => {
        reset();
        setIsEditMode(false);
        setEditingItemCategory(null);
    };

    const handleEdit = (itemCategory: ItemCategoryDto) => {
        setIsEditMode(true);
        setEditingItemCategory(itemCategory);
        setValue("itemCategoryName", itemCategory.itemCategoryName);
        setFocus("itemCategoryName");
    };


    const handleDelete = async (row: ItemCategoryDto) => {
        if (row.itemCategoryID === undefined) {
            toast.error('Error: Invalid item Category ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the item Category "${row.itemCategoryName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.ItemCategory.deleteItemCategory(accessId, row.itemCategoryID);
                toast.success(`Item Category "${row.itemCategoryName}" deleted successfully`);
                fetchItemCategories();
            } catch (error) {
                console.error('Error deleting item Category:', error);
                toast.error('Error deleting item Category');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingItemCategory(null);
                reset();
                setFocus('itemCategoryName');
            }
        }
    };

    return (
        <CommonCard header="Item Category">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={10}>
                        <CustomInput
                            autoFocus
                            label="Item Category Name"
                            name="itemCategoryName"
                            register={register}
                            validationRules={{ required: "Item Category Name is required." }}
                            error={errors.itemCategoryName}
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
                data={itemCategories}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showSrNo
            />
        </CommonCard>
    );
}

export default ItemCategoryForm;
