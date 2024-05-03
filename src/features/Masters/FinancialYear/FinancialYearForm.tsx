import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../app/store/configureStore';
import { setLoading } from '../../../app/layout/loadingSlice';
import CommonCard from '../../../app/components/CommonCard';
import { updateAndFetchCurrentFinancialYear } from './financialYearSlice';
import { FinancialYearDto } from './financialYearDto';
import toast from 'react-hot-toast';
import agent from '../../../app/api/agent';
import DatePicker from "react-datepicker"; // Corrected import
import "react-datepicker/dist/react-datepicker.css";
import { Col, Form, Row } from 'react-bootstrap'; // Added Button import
import FormNavigator from '../../../app/components/FormNavigator';
import CustomButton from '../../../app/components/CustomButton';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import { getAccessIdOrRedirect } from '../Company/CompanyInformation';

interface FinancialYearFormProps {
    financialYearId?: number;
    onSuccessfulSubmit?: () => void;
}
function FinancialYearForm({  onSuccessfulSubmit }: FinancialYearFormProps) {
    const dispatch = useAppDispatch();
    // const navigate = useNavigate();
    const location = useLocation();
    const financialYearToEdit = location.state?.financialYear;

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FinancialYearDto>({
        defaultValues: {
            financialYearFrom: financialYearToEdit ? new Date(financialYearToEdit.financialYearFrom) : new Date(new Date().getFullYear() + 1, 3, 1)
        }
    });

    // Register the DatePicker component
    useEffect(() => {
        register('financialYearFrom', { required: 'Financial year start date is required' });
    }, [register]);

    const financialYearFrom = watch('financialYearFrom');

    const onSubmit = async (data: FinancialYearDto) => {
        dispatch(setLoading(true));
        try {
            const accessId = getAccessIdOrRedirect();
            if (financialYearToEdit) {
                data.id = financialYearToEdit.id;
                await agent.FinancialYear.update(accessId, data);
                toast.success('Financial Year updated successfully');
            } else {
                await agent.FinancialYear.create(accessId, data);
                toast.success('Financial Year created successfully');
            }
            dispatch(updateAndFetchCurrentFinancialYear(data.financialYearFrom));
            if (onSuccessfulSubmit)
                onSuccessfulSubmit();

            // navigate('/dashboard');
        } catch (error) {
            handleApiErrors(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <CommonCard header={'Add Financial Year'} size='25%'>
            <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={true}>
                <Form.Group controlId="financialYearFrom">
                    <Row>
                        <Form.Label>Financial Year Start Date</Form.Label>
                    </Row>
                    <Row>
                        <DatePicker
                            selected={new Date(financialYearFrom)}
                            onChange={(date: Date) => setValue('financialYearFrom', date)}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="DD-MM-YYYY"
                            className="form-control"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                        />
                        {errors.financialYearFrom && <Form.Text className="text-danger">{errors.financialYearFrom.message}</Form.Text>}
                        <Col className="text-right justify-content-end">
                            <CustomButton type="submit" isSubmitting={isSubmitting} className="mt-3" text={financialYearToEdit ? 'Update' : 'Save'} showAtEnd />
                        </Col>
                    </Row>
                </Form.Group>

            </FormNavigator>
        </CommonCard >
    );
}

export default FinancialYearForm;
