import { Col, Row } from 'react-bootstrap'
import { CustomInput, CustomDropdown } from '../../../app/components/Components'
import { Control, UseFormRegister } from 'react-hook-form';
import { AccountDto } from './accountDto';
import { OptionType } from '../../../app/models/optionType';



interface DefaultFieldsProps {
    register: UseFormRegister<AccountDto>;
    control: Control<AccountDto>;
    errors: {
        [key: string]: any;
    };
    measurementsOptions: OptionType[];
    partyTypesOptions: OptionType[];
    cityOptions: OptionType[];
    stateOptions: OptionType[];
    accessId: string
}

function DefaultFields({ register, control, errors, measurementsOptions, partyTypesOptions, cityOptions, stateOptions }: DefaultFieldsProps) {


    return (
        <>
            <Row>
                <Col md={3}>
                    <CustomDropdown
                        label="Party Type"
                        name="partyType"
                        options={partyTypesOptions}
                        control={control}
                        error={errors.partyType}
                    // validationRules={{ required: "Party type is required" }}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="GSTIN"
                        name="gstNo"
                        register={register}
                        maxLength={16}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="PAN"
                        name="panNo"
                        register={register}
                        maxLength={16}
                    />
                </Col>
                <Col md={3}>
                    <CustomDropdown
                        name="stateId"
                        label="State"
                        options={stateOptions}
                        control={control}
                        error={errors.stateId}
                    // validationRules={{ required: "State is required" }}
                    />
                </Col>


            </Row>
            <Row>
                <Col md={3}>
                    <CustomDropdown
                        name="cityId"
                        label="City"
                        options={cityOptions}
                        control={control}
                    />
                </Col>
                <Col md={6}>
                    <CustomInput
                        label="Print Address"
                        name="printAddress"
                        register={register}
                        maxLength={150}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="Contact Person/Owner Name"
                        name="contactPerson"
                        register={register}
                        maxLength={150}
                    />
                </Col>

            </Row>
            <Row>
                <Col md={3}>
                    <CustomInput
                        label="Mobile No 1"
                        name="mobileNo"
                        register={register}
                        maxLength={25}
                    // validationRules={{ pattern: { value: /^[0-9]+$/, message: "Invalid mobile number" } }}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="Mobile No 2"
                        name="mobileNo2"
                        register={register}
                        maxLength={25}
                    // validationRules={{ pattern: { value: /^[0-9]+$/, message: "Invalid mobile number" } }}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="Email"
                        name="emailId"
                        register={register}
                        maxLength={100}
                    // validationRules={{ pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email format" } }}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="Aadhar No"
                        name="aadharNo"
                        register={register}
                        maxLength={16}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={3}>
                    <CustomInput
                        label="Extra License 1"
                        name="dlNo1"
                        register={register}
                        maxLength={50}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="Extra License 2"
                        name="dlNo2"
                        register={register}
                        maxLength={50}
                    />
                </Col>
                <Col md={3}>
                    <CustomDropdown
                        name="measurement"
                        label="Measurements for Ledger"
                        options={measurementsOptions}
                        control={control}
                    />
                </Col>
                <Col md={3}>
                    <Row>
                        <Col md={6}>
                            <CustomInput
                                label="Discount %"
                                name="discountPercentage"
                                allowedChars="numericDecimal"
                                register={register}
                            />
                        </Col>
                        <Col md={6}>
                            <CustomInput
                                label="Margin %"
                                name="marginPercentage"
                                allowedChars="numericDecimal"
                                register={register}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <CustomInput
                        label="Print Remarks"
                        name="remarks"
                        register={register}
                        maxLength={1000} // Adjust the maxLength as per your DTO
                    />
                </Col>
            </Row>
        </>
    )
}

export default DefaultFields
