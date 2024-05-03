import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { FieldError, FieldErrorsImpl, Merge, UseFormRegister, UseFormSetValue } from "react-hook-form"; // Use this only if you need to access the form context for other reasons
import { FinancialYearDto } from "../../features/Masters/FinancialYear/financialYearDto";
import { warningToast } from "../utils/toastUtils";
import { format, parse, isValid, isAfter, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import CustomLabel from "./CustomLabel";


interface CustomDateInputBoxProps {
    name: string;
    label?: string;
    className?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    placeholder?: string;
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
    validationRules?: Record<string, any>;
    financialYear: FinancialYearDto | null;
    defaultDate?: string | Date | null;
    WarningForAdvanceEntry?: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;
    style?: React.CSSProperties; // Add this line

}

const CustomDateInputBox: React.FC<CustomDateInputBoxProps> = ({
    name,
    label,
    className,
    autoFocus = false,
    disabled = false,
    placeholder = "DDMM",
    register,
    setValue,
    error,
    validationRules = {},
    financialYear,
    defaultDate,
    WarningForAdvanceEntry = false,
    inputRef,
    style,
    ...rest
}) => {

    const [inputValue, setInputValue] = useState<string>('');
    const [localError, setLocalError] = useState<string>('');
    const [dayName, setDayName] = useState('');

    useEffect(() => {
        if (defaultDate) {
            const formattedDefaultDate = format(new Date(defaultDate), 'dd-MM-yyyy');
            setInputValue(formattedDefaultDate);
            setValue(name, formattedDefaultDate);

        }
    }, [defaultDate, setValue, name]);

    const updateDayName = (date: string) => {
        const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
        const dayOfWeek = format(parsedDate, 'eeee');
        setDayName(dayOfWeek);
    }

    const determineYearForInput = (month: number): number => {
        if (!financialYear) {
            throw new Error("Financial year is not defined");
        }

        const fyStart = typeof financialYear.financialYearFrom === 'string' ? parseISO(financialYear.financialYearFrom) : financialYear.financialYearFrom;
        const fyEnd = typeof financialYear.financialYearTo === 'string' ? parseISO(financialYear.financialYearTo) : financialYear.financialYearTo;
        const fyStartMonth = fyStart.getMonth() + 1;
        const fyEndMonth = fyEnd.getMonth() + 1;
        const fyStartYear = fyStart.getFullYear();
        const fyEndYear = fyEnd.getFullYear();


        if ((month >= fyStartMonth && fyStartYear === fyEndYear) || (month >= fyStartMonth && month <= 12)) {
            return fyStartYear;
        } else if (month <= fyEndMonth && month >= 1) {
            return fyEndYear;
        } else {
            return fyStartYear;
        }
    };

    const formatInputValue = (value: string): string => {
        let formattedValue = value;

        if (value.length === 2) {
            const day = value.substring(0, 1);
            const month = value.substring(1, 2);
            const year = determineYearForInput(Number(month));
            formattedValue = `0${day}-0${month}-${year}`;

        } else if (value.length === 3) {
            const day = value.substring(0, 1);
            const month = value.substring(1, 3);
            const year = determineYearForInput(Number(month));
            formattedValue = `0${day}-${month}-${year}`;
        }
        if (formattedValue.length === 4) {
            const day = value.substring(0, 2);
            const month = value.substring(2, 4);
            const year = determineYearForInput(Number(month));
            formattedValue = `${day}-${month}-${year}`;
        }
        return formattedValue;
    };

    const validateDate = (dateStr: string): boolean => {
        const date = parse(dateStr, 'dd-MM-yyyy', new Date());
        if (!financialYear) return false;
        const fyStart = startOfDay(typeof financialYear.financialYearFrom === 'string' ? parseISO(financialYear.financialYearFrom) : financialYear.financialYearFrom);
        const fyEnd = startOfDay(typeof financialYear.financialYearTo === 'string' ? parseISO(financialYear.financialYearTo) : financialYear.financialYearTo);
        return isValid(date) && isWithinInterval(date, { start: fyStart, end: fyEnd });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value.replace(/[^\d]/g, '');
        setInputValue(rawValue);
    };

    const handleBlur = () => {
        const formattedValue = formatInputValue(inputValue);
        const isFutureDate = isAfter(parse(formattedValue, 'dd-MM-yyyy', new Date()), new Date());

        if (validateDate(formattedValue)) {
            if (WarningForAdvanceEntry && isFutureDate) {
                warningToast('Warning: Future date is selected.');
            }
            setInputValue(formattedValue);
            setValue(name, formattedValue, { shouldValidate: true })
            updateDayName(formattedValue);
            setLocalError('');
        }
        else {
            ('Out of financial year.');
            if (inputRef && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }
    };
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        event.currentTarget.select();
    };
    const isRequired = validationRules?.required;

    return (
        <>
            <Form.Group style={style}>
                {label && (
                    <CustomLabel htmlFor={name} label={label} required={isRequired} badgeText={dayName} />
                )}
                <Form.Control
                    autoFocus={autoFocus}
                    className={`app-form-input`}
                    id={name}
                    type="text"
                    placeholder={placeholder}
                    {...register(name, validationRules)} // Spread the register function with validation rules
                    isInvalid={!!localError || !!error}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    disabled={disabled}
                    autoComplete="off"
                    {...rest}
                    maxLength={4}
                    ref={inputRef}
                />
                <Form.Control.Feedback type="invalid">
                    {error && typeof error.message === "string" ? error.message : null}
                </Form.Control.Feedback>
            </Form.Group>

        </>
    );
};

export default CustomDateInputBox;
