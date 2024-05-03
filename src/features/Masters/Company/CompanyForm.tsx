import { Row, Col, FormGroup, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import agent from '../../../app/api/agent';
import {
	extractPANFromGSTIN,
	extractStateCodeFromGSTIN,
	gstValidation,
} from '../../../app/validations/commonValidations';
import { useEffect, useState } from 'react';
import {
	CommonCard,
	CustomInput,
	CustomButton,
	FormNavigator,
	CustomDropdown,
	CustomDatePicker,
} from '../../../app/components/Components';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import { useAppDispatch } from '../../../app/store/configureStore';
import { setLoading } from '../../../app/layout/loadingSlice';
import {
	deleteStoredCompanyInformation,
	getAccessId,
} from './CompanyInformation';
import { useStates } from '../../../app/hooks/useStatesOptions';
import { format } from 'date-fns';
import { formatDateForBackend } from '../../../app/utils/dateUtils';

function CreateCompany() {
	const accessId = getAccessId();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const currentYear = new Date().getFullYear();
	const defaultFinancialYearFrom = format(
		new Date(currentYear, 3, 1),
		'dd-MM-yyyy'
	);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		control,
		formState: { isSubmitting, errors, isValid },
	} = useForm<CompaniesMasterDto>({
		mode: 'all',
	});
	const [isPanManuallyEdited, setIsPanManuallyEdited] = useState(false);
	const stateOptions = useStates();
	const gstin = watch('gstNo');

	// Load company data and set form values
	useEffect(() => {
		const fetchCompanyData = async () => {
			if (!accessId) {
				reset(); // Reset the form if no accessId is present
				return;
			}
			dispatch(setLoading(true));
			try {
				const companyData = await agent.Company.getCompanyDetail(
					accessId
				);
				if (companyData) {
					Object.keys(companyData).forEach((key) => {
						if ((key as keyof CompaniesMasterDto) in companyData) {
							const safeKey = key as keyof CompaniesMasterDto;
							setValue(safeKey, companyData[safeKey]);
						}
					});
				}
			} catch (error) {
				console.error('Error fetching company details:', error);
			} finally {
				dispatch(setLoading(false));
			}
		};
		fetchCompanyData();
	}, [accessId, reset, setValue, dispatch]);

	// Extract PAN and State from GSTIN
	useEffect(() => {
		if (!accessId) {
			if (!isPanManuallyEdited && gstin) {
				const extractedPan = extractPANFromGSTIN(gstin);
				setValue('panNo', extractedPan);
				const stateCode = extractStateCodeFromGSTIN(gstin);
				const matchingState =
					stateCode &&
					stateOptions.find((option) =>
						option.label.includes(stateCode)
					);
				if (matchingState) {
					setValue('state', matchingState.value);
				}
			}
		}
	}, [gstin, isPanManuallyEdited, setValue, stateOptions]);
	// Handle manual PAN change

	const handlePanChange = () => {
		setIsPanManuallyEdited(true);
	};

	async function onSubmit(data: CompaniesMasterDto) {
		try {
			deleteStoredCompanyInformation();
			dispatch(setLoading(true));

			if (accessId) {
				// Update company
				await agent.Company.update(data).then(() => {
					toast.success('Company updated successfully');
				});
			} else {
				// Create new company
				data.financialYearFrom = formatDateForBackend(
					data.financialYearFrom
				);
				await agent.Company.create(data).then(() => {
					toast.success('Company created successfully');
				});
			}
			navigate('/select-company');
		} catch (error) {
			handleApiErrors(error);
		}
		dispatch(setLoading(false));
	}

	const style = {
		border: 'none',
	};

	return (
		<CommonCard
			header={accessId ? 'Update Company' : 'Create New Company'}
			size="100%"
			footerContent="Note : All above information will be printed on Invoice. "
		>
			<Form className="p-3">
				<FormNavigator onSubmit={handleSubmit(onSubmit)}>
					<Row className="mb-2">
						{/* GST Number, PAN Number, State */}
						<Col md={6} sm={12}>
							<CustomInput
								type="text"
								label="GST Number"
								name="gstNo"
								register={register}
								error={errors.gstNo}
								maxLength={15}
								allowedChars="alphanumeric"
								validationRules={{
									validate: {
										gstFormat: (value: string) =>
											gstValidation(value) || true,
									},
								}}
							/>
						</Col>
						<Col md={6} sm={12}>
							<CustomInput
								type="text"
								label="PAN Number"
								name="panNo"
								register={register}
								validationRules={{
									required: 'PAN No. is required',
								}}
								error={errors.panNo}
								maxLength={10}
								onChange={handlePanChange}
								allowedChars="alphanumeric"
							/>
						</Col>
					</Row>
					<Col md={12} sm={12}>
						<CustomDropdown
							name="state"
							label="Select State"
							options={stateOptions}
							control={control}
							error={errors.state}
							validationRules={{
								required: 'State is required',
							}}
						/>
					</Col>
					<Row className="mb-2">
						{/* Company Name, Financial Year From, Nature of Business */}
						<Col md={8} sm={12}>
							<CustomInput
								style={style}
								type="text"
								label="Company Name"
								name="companyName"
								register={register}
								error={errors.companyName}
								maxLength={200}
							/>
						</Col>
						{!accessId && (
							<>
								<Col md={4} sm={6}>
									<CustomDatePicker
										label="Financial Year Start Date"
										name="financialYearFrom"
										register={register}
										error={
											errors.financialYearFrom?.message
										}
										defaultValue={defaultFinancialYearFrom}
									/>
								</Col>
								{/* <Col md={2} sm={6}>
                                <CustomDatePicker
                                    label="End Date"
                                    name="financialYearTo"
                                    error={errors.financialYearTo?.message}
                                    value={financialYearTo}
                                    disabled={true}
                                    register={register}
                                />
                            </Col> */}
							</>
						)}
					</Row>
					<Row className="mb-2">
						{/* Address Line 1, 2, and City */}
						<Col md={12} sm={12}>
							<CustomInput
								type="text"
								label="Address Line 1"
								name="address1"
								register={register}
								error={errors.address1}
								maxLength={300}
							/>
						</Col>
						<Col md={12} sm={12}>
							<CustomInput
								type="text"
								label="Address Line 2"
								name="address2"
								register={register}
								error={errors.address2}
								maxLength={100}
							/>
						</Col>
						<Col md={12} sm={12}>
							<CustomInput
								type="text"
								label="City"
								name="city"
								register={register}
								error={errors.city}
								maxLength={20}
							/>
						</Col>
					</Row>
					<Row>
						{/* District, PinCode, */}
						<Col md={10} sm={12}>
							<CustomInput
								type="text"
								label="District"
								name="district"
								register={register}
								error={errors.district}
								maxLength={50}
							/>
						</Col>
						<Col md={2} sm={12}>
							<CustomInput
								type="text"
								label="Pincode"
								name="pincode"
								register={register}
								error={errors.pincode}
								maxLength={10}
								allowedChars="numeric"
							/>
						</Col>
					</Row>
					<Row className="mb-2">
						{/* Mobile, Secondary Mobile, Email */}

						<Col md={6} sm={12}>
							<CustomInput
								type="text"
								label="Mobile Number"
								name="mobileNo"
								register={register}
								error={errors.mobileNo}
								maxLength={15}
								allowedChars="numeric"
							/>
						</Col>
						<Col md={6} sm={12}>
							<CustomInput
								type="text"
								label="Mobile Number 2"
								name="mobileNo2"
								register={register}
								error={errors.mobileNo2}
								maxLength={15}
								allowedChars="numeric"
							/>
						</Col>
						<Col md={12} sm={12}>
							<CustomInput
								className="email-field "
								autoFocus={false}
								type="text"
								label="Email"
								name="email"
								register={register}
								error={errors.email}
								maxLength={200}
							/>
						</Col>
					</Row>
					<Row className="mb-2">
						{/* License Number 1, 2, 3 */}
						<Col md={4} sm={12}>
							<CustomInput
								type="text"
								label="License Number 1"
								name="licenseNumber1"
								register={register}
								error={errors.licenseNumber1}
								maxLength={100}
							/>
						</Col>
						<Col md={4} sm={12}>
							<CustomInput
								type="text"
								label="License Number 2"
								name="licenseNumber2"
								register={register}
								error={errors.licenseNumber2}
								maxLength={100}
							/>
						</Col>
						<Col md={4} sm={12}>
							<CustomInput
								type="text"
								label="License Number 3"
								name="licenseNumber3"
								register={register}
								error={errors.licenseNumber3}
								maxLength={100}
							/>
						</Col>
					</Row>

					<Row>
						<Col className="text-center">
							<FormGroup className="mt-3 create-company-btn-container">
								<CustomButton
									text={
										accessId
											? 'Update Company'
											: 'Create Company'
									}
									className="btn-primary create-company-btn"
									type="submit"
									isSubmitting={isSubmitting}
									isValid={isValid}
									showAtEnd
								/>
							</FormGroup>
						</Col>
					</Row>
				</FormNavigator>
			</Form>
		</CommonCard>
	);
}
export default CreateCompany;
