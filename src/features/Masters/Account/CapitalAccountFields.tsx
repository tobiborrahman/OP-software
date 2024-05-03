import { Col, Row } from 'react-bootstrap'
import { CustomInput } from '../../../app/components/Components'
import { UseFormRegister } from 'react-hook-form';
import { AccountDto } from './accountDto';

interface CapitalAccountFieldsProps {
    register: UseFormRegister<AccountDto>;
    errors: {
        [key: string]: any;
    };

}

const CapitalAccountFields = ({ register }: CapitalAccountFieldsProps) => {
    return (
        <div className="Capital Accounts">
            <Row>
                <Col md={3}>
                    <CustomInput
                        label="Share %"
                        name="sharePercentage"
                        type="numberDecimal"
                        register={register}
                        allowedChars="numericDecimal"
                        maxLength={3}
                    />
                </Col>
                <Col md={3}>
                    <CustomInput
                        label="Capital Salary (yearly)"
                        name="capitalSalary"
                        type="numberDecimal"
                        register={register}
                        allowedChars="numericDecimal"

                    />
                </Col>
            </Row>
        </div>
    )
}

export default CapitalAccountFields
