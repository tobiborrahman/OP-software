import React from 'react';
import Select, { components } from 'react-select';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import CustomLabel from './CustomLabel';
import { Controller, FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { OptionType } from '../models/optionType';
import CreatableSelect from 'react-select/creatable';

interface CustomDropdownProps {
    label?: string;
    name: string;
    options: OptionType[];
    className?: string;
    control?: any;
    validationRules?: Record<string, any>;
    error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
    defaultValue?: OptionType;
    onChangeCallback?: (value: OptionType | null) => void;
    isCreatable?: boolean;
    onCreateOption?: (inputValue: string) => void;
    showCreateButton?: boolean;
    onCreateButtonClick?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
    onKeyPress?: (event: React.KeyboardEvent<HTMLElement>) => void;
    onInputChange?: (newValue: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    YesNo?: boolean;
    disabled?: boolean;
    showF3New?: boolean;
    isSearchable?: boolean;
    badgeText?: string;
    badgeStyle?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    style?: React.CSSProperties; // Add this line
    dropDownWidth?: string;
    hideClearIcon?: boolean;
    hideDropdownIcon?: boolean;
    isInTable?: boolean;
    onFocus?: () => void;
    focusTrigger?: boolean;

}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    label,
    name,
    options,
    control,
    className,
    validationRules,
    error,
    defaultValue,
    onChangeCallback,
    isCreatable = false,
    onCreateOption,
    showCreateButton = false,
    onCreateButtonClick,
    onKeyDown,
    onKeyPress,
    isLoading = false,
    placeholder = "",
    onInputChange,

    YesNo = false,

    showF3New = true,
    isSearchable = true,
    disabled,
    badgeText,
    badgeStyle,
    style,
    dropDownWidth,
    hideClearIcon = false,
    hideDropdownIcon = false,

    isInTable = false,
    onFocus,
    focusTrigger = false,
    ...rest
}) => {


    const DropdownIndicator = (props: any) => {
        if (hideDropdownIcon) {
            return null; // Do not render the dropdown indicator
        }
        return <components.DropdownIndicator {...props} />;
    };

    const ClearIndicator = (props: any) => {
        if (hideClearIcon) {
            return null; // Do not render the clear indicator
        }
        return <components.ClearIndicator {...props} />;
    };
    const customSelectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            border: '1px solid #B0BEC5 !important',
            backgroundColor: '#F7FAFC !important',
            borderRadius: '5px !important',
            fontSize: isInTable ? '1.0rem' : '1.2rem !important',
            minHeight: isInTable ? '32px' : '38px',
            padding: isInTable ? '0px 0px' : provided.padding,
            fontWeight: '500',
            color: '#37474F !important',
            outline: 'none !important',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(25, 118, 210, 0.5) !important' : 'none',
            '&:hover': {
                borderColor: '#29B6F6 !important'
            },
            transition: 'border-color 0.3s, box-shadow 0.3s !important',


        }),
        menu: (provided: any) => ({
            ...provided,
            fontSize: isInTable ? '1.0rem' : '1.2rem !important',
            minWidth: dropDownWidth || 'auto',

        }),

    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'F3') {
            event.preventDefault(); // Prevent default behavior of F3 key
            onCreateButtonClick?.();
        }
    };


    const SelectComponent = isCreatable ? CreatableSelect : Select;

    // Conditionally set options and isSearchable based on YesNo prop
    const finalOptions = YesNo ? [
        { value: 'N', label: 'N' },
        { value: 'Y', label: 'Y' }
    ] : options;

    const handleInternalFocus = () => {
        if (onFocus) {
            onFocus();
        }
    };


    return (


        <Form.Group as={Col} className={className} style={style}>
            {label && <CustomLabel
                htmlFor={name}
                label={label + (isCreatable && onCreateButtonClick && showF3New ? '  [F3-NEW]' : '')}
                required={validationRules?.required}
                badgeStyle={badgeStyle}
                badgeText={badgeText}
            />
            }
            <Controller
                name={name}
                control={control}
                rules={validationRules}
                defaultValue={defaultValue || (YesNo ? 'N' : '')}
                render={({ field }) => (
                    <SelectComponent
                        {...field}
                        id={name}
                        autoFocus={focusTrigger}
                        classNamePrefix="select"
                        options={finalOptions}
                        components={{ DropdownIndicator, ClearIndicator }}
                        value={finalOptions.find(option => option.value === field.value)}
                        onChange={(newValue) => {
                            const value = newValue ? (newValue as OptionType).value : '';
                            field.onChange(value);
                            onChangeCallback?.(newValue as OptionType | null);
                        }}
                        styles={customSelectStyles}
                        placeholder={isLoading ? "Loading..." : placeholder}
                        isSearchable={isSearchable}
                        isLoading={isLoading}
                        openMenuOnFocus={true}
                        onCreateOption={onCreateOption}
                        menuPlacement='bottom'
                        menuPosition="fixed"
                        onKeyDown={handleKeyDown}
                        isDisabled={disabled}
                        onInputChange={onInputChange}
                        onFocus={handleInternalFocus}
                        isClearable
                        {...rest}
                    />
                )}
            />
            {
                error && (
                    <Form.Control.Feedback type="invalid">
                        {typeof error.message === "string" ? error.message : null}
                    </Form.Control.Feedback>
                )
            }
        </Form.Group >
    )
};


export default CustomDropdown;
