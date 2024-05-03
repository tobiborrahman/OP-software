
import { Col, Row } from 'react-bootstrap'
import { CustomInput } from '../../../app/components/Components'
import { UseFormRegister } from 'react-hook-form';
import { AccountDto } from './accountDto';


interface FixedAssetFieldsProps {
    register: UseFormRegister<AccountDto>;
    errors: {
        [key: string]: any;
    };

}

const FixedAssetFields = ({ register }: FixedAssetFieldsProps) => {
    return (

        <div className="Fixed Assets">
            <Row>

                <Col md={3}>
                    <CustomInput
                        label="Deprecation %"
                        name="depreciationPercentage"
                        type="numberDecimal"
                        register={register}
                        allowedChars="numericDecimal"
                        maxLength={2}
                    />
                </Col>
            </Row>

        </div>
    )
}

export default FixedAssetFields
