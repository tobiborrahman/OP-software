import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Col, Row } from "react-bootstrap";
import agent from "../../../app/api/agent";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";
import CityDto from "./cityDto";
import { CommonCard, CommonTable, CustomButton, CustomInput, FormNavigator } from "../../../app/components/Components";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";
function CityForm() {

    const { register, handleSubmit, setValue, setFocus, formState: { errors, isSubmitting, isValid }, reset } = useForm<CityDto>();
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [cities, setCities] = useState<CityDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCity, setEditingCity] = useState<CityDto | null>(null);

    const columns: ColumnDef<CityDto>[] = [
        {
            accessorFn: row => row.cityName,
            id: 'cityName',
            header: 'City Name',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.pincode,
            id: 'pincode',
            header: 'Pincode',
            cell: info => info.getValue(),
        },
        // Add more columns as needed
    ];

    const getAllCities = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedCities = await agent.City.getAllCities(accessId);
            setCities(fetchedCities);
        } catch (error) {
            console.error("Error fetching cities", error);
            toast.error("Error fetching cities");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllCities();
    }, [dispatch]);

    const onSubmit = async (data: CityDto) => {
        dispatch(setLoading(true));
        try {
            if (accessId) {
                if (editingCity && editingCity.cityID !== undefined) {
                    await agent.City.updateCity(accessId, editingCity?.cityID, data);
                    toast.success('City updated successfully');
                } else {
                    await agent.City.createCity(accessId, data);
                    toast.success('City created successfully');
                }
                getAllCities();
            }
        } catch (error: any) {
            handleApiErrors(errors);
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingCity(null);
            reset();
            setFocus('cityName');
        }
    };

    const handleEdit = (row: CityDto) => {
        setEditingCity(row);
        setIsEditMode(true);
        setValue('cityName', row.cityName);
        setValue('pincode', row.pincode);
        setValue('cityID', row.cityID);
        setFocus('cityName');
    };

    const handleDelete = async (row: CityDto) => {
        if (row.cityID === undefined) {
            toast.error('Error: Invalid city ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the city "${row.cityName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.City.deleteCity(accessId, row.cityID);
                toast.success(`City "${row.cityName}" deleted successfully`);
                getAllCities();
            } catch (error) {
                console.error('Error deleting city:', error);
                toast.error('Error deleting city');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingCity(null);
                reset();
                setFocus('cityName');
            }
        }
    };

    return (
        <CommonCard header='City'>
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={12}>
                        <CustomInput
                            autoFocus
                            label="City Name"
                            name='cityName'
                            register={register}
                            validationRules={{ required: 'City Name cannot be empty.' }}
                        />
                    </Col>
                    <Col xs={12} md={10}>
                        <CustomInput
                            label="Pincode"
                            name='pincode'
                            register={register}
                            validationRules={{ required: 'Pincode cannot be empty.' }}
                            allowedChars="numeric"
                        />
                    </Col>
                    <Col xs={12} md={2} className="d-flex align-items-end mb-2">
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
                data={cities}
                columns={columns}
                onEdit={(row) => handleEdit(row)}
                onDelete={(row) => handleDelete(row)}
                showSrNo
            />
        </CommonCard>
    )
}

export default CityForm;
