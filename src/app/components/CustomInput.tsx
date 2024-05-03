import React from 'react';
import Form from 'react-bootstrap/Form';
import {
	FieldError,
	FieldErrorsImpl,
	Merge,
	UseFormRegister,
} from 'react-hook-form';
import CustomLabel from './CustomLabel';
import './CustomStyles.scss';

interface CustomInputProps {
	label?: string;
	name: string;
	register?: UseFormRegister<any>;
	validationRules?: Record<string, any>;
	error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
	asCol?: boolean | 'auto' | number | null;
	placeholder?: string;
	type?: string;
	className?: string;
	autoFocus?: boolean;
	maxLength?: number;
	allowedChars?:
		| 'all'
		| 'special'
		| 'numeric'
		| 'numericDecimal'
		| 'alphanumeric'
		| 'alpha';
	size?: 'lg' | 'sm' | undefined;
	value?: string | null;
	defaultValue?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	forceUpperCase?: boolean;
	disabled?: boolean;
	isTextRight?: boolean;
	isTextCenter?: boolean;
	autoComplete?: string;
	badgeText?: string;
	badgeStyle?:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'danger'
		| 'warning'
		| 'info'
		| 'light'
		| 'dark';
	style?: React.CSSProperties;
	rightElement?: React.ReactNode;
}

const CustomInput: React.FC<CustomInputProps> = ({
	label,
	name,
	register,
	validationRules,
	error,
	asCol,
	placeholder,
	type = 'text',
	className,
	autoFocus,
	maxLength,
	allowedChars = 'all',
	size,
	value,
	defaultValue,
	forceUpperCase = true,
	disabled = false,
	isTextRight = false,
	autoComplete = 'off',
	badgeText,
	badgeStyle,
	isTextCenter,
	style,
	onKeyDown,
	rightElement,
	...rest
}) => {
	const isRequired = validationRules?.required;

	const effectiveMaxLength =
		allowedChars === 'numeric' || allowedChars === 'numericDecimal'
			? 18
			: maxLength;

	const isTextCentered =
		allowedChars === 'numeric' ||
		allowedChars === 'numericDecimal' ||
		isTextCenter;

	const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
		let currentValue = event.currentTarget.value;
		let regex;
		if (forceUpperCase && type !== 'password') {
			currentValue = currentValue.toUpperCase();
			event.currentTarget.value = currentValue;
		}

		if (allowedChars === 'numericDecimal') {
			if ((currentValue.match(/\./g) || []).length > 1) {
				event.currentTarget.value = currentValue.slice(
					0,
					currentValue.length - 1
				);
				return;
			}
		}

		switch (allowedChars) {
			case 'special':
				regex = /^[!@#$%^&*(),.?":{}|<>]*$/;
				break;
			case 'numeric':
				regex = /^\d*$/;
				break;
			case 'numericDecimal':
				regex = /^[\d.]*$/;
				break;
			case 'alphanumeric':
				regex = /^[a-z0-9]*$/i;
				break;
			case 'alpha':
				regex = /^[A-Za-z]*$/;
				break;
			default:
				regex = /^.*$/; // All characters allowed
		}

		if (!regex.test(currentValue)) {
			// Find the last valid substring and revert to it
			for (let i = currentValue.length - 1; i >= 0; i--) {
				if (regex.test(currentValue.substring(0, i))) {
					event.currentTarget.value = currentValue.substring(0, i);
					break;
				}
			}
		}
	};

	const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
		event.target.select();
	};
	const onKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (onKeyDown) {
			onKeyDown(event);
		}
	};

	return (
		<Form.Group style={style}>
			{label && (
				<CustomLabel
					htmlFor={name}
					label={label}
					required={isRequired}
					badgeStyle={badgeStyle}
					badgeText={badgeText}
				/>
			)}
			<Form.Control
				autoFocus={autoFocus}
				id={name}
				type={type}
				placeholder={placeholder}
				{...(register ? register(name, validationRules) : {})}
				isInvalid={!!error}
				className={`app-form-input ${
					isTextCentered ? 'center-text-input' : ''
				} ${isTextRight ? 'right-text-input' : ''} ${className || ''}`}
				maxLength={effectiveMaxLength}
				onFocus={handleFocus}
				onInput={handleInput}
				onKeyDown={onKeyDownHandler}
				size={size}
				value={value === null ? '' : value} // Convert null to empty string
				defaultValue={defaultValue}
				disabled={disabled}
				autoComplete={autoComplete}
				{...rest}
			/>
			<Form.Control.Feedback type="invalid">
				{error && typeof error.message === 'string'
					? error.message
					: null}
			</Form.Control.Feedback>
		</Form.Group>
	);
};

export default CustomInput;
