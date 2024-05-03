import React, { useEffect, useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import Form from "react-bootstrap/Form";
import CustomLabel from "./CustomLabel";
import { UseFormRegister } from 'react-hook-form';

interface CustomDatePickerProps {
    label?: string;
    name: string;
    value?: string; // Date in 'dd-MM-yyyy' format
    onChange?: (name: string, date: string | undefined) => void; // Callback with the date in 'dd-MM-yyyy' format or undefined if invalid
    error?: string;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    register?: UseFormRegister<any>;
    validationRules?: Record<string, any>;
    defaultValue?: string;

}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    label,
    name,
    value = '',
    onChange,
    register,
    error,
    placeholder = 'dd-MM-yyyy',
    disabled = false,
    validationRules,
    defaultValue
}) => {
    const [inputValue, setInputValue] = useState<string>(value || defaultValue || '');

    useEffect(() => {
        setInputValue(value || defaultValue || '');
    }, [value, defaultValue]);

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        event.target.select();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue); // Update local state
        const parsedDate = parse(newValue, 'dd-MM-yyyy', new Date());
        if (isValid(parsedDate)) {
            onChange && onChange(name, format(parsedDate, 'dd-MM-yyyy'));
        } else {
            onChange && onChange(name, undefined);
        }
    };


    return (
        <Form.Group>
            {label && <CustomLabel htmlFor={name} label={label} />}

            <Form.Control
                type="text"
                id={name}
                {...(register ? register(name, validationRules) : {})}
                value={inputValue}
                onChange={handleChange}
                className='app-form-input'
                placeholder={placeholder}
                disabled={disabled}
                onFocus={handleFocus}
                isInvalid={!!error}
                defaultValue={defaultValue}
                maxLength={10}


            />
            {error && (
                <Form.Control.Feedback type="invalid">
                    <Form.Text className="text-danger">{error}</Form.Text>
                </Form.Control.Feedback>
            )}
        </Form.Group>
    );
};

export default CustomDatePicker;
