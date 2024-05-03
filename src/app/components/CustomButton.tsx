import React from 'react';
import Button from 'react-bootstrap/Button';

interface CustomButtonProps {
	variant?:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'warning'
		| 'danger'
		| 'info'
		| 'light'
		| 'dark'
		| 'outline-primary'
		| 'outline-success'
		| 'outline-secondary'
		| 'outline-info'
		| 'none'
		| 'outline-danger';
	size?: 'sm' | 'lg';
	isSubmitting?: boolean;
	isValid?: boolean;
	onClick?: (e: any) => void;
	children?: React.ReactNode;
	className?: string;
	type?: 'button' | 'submit' | 'reset';
	block?: boolean;
	icon?: string;
	text: string;
	style?: object;
	showAtEnd?: boolean;
}

const CustomButton = ({
	variant = 'primary',
	size,
	isSubmitting,
	isValid = true,
	onClick,
	children,
	className,
	type = 'button',
	block = false,
	icon,
	text,
	style,
	showAtEnd = false,
}: CustomButtonProps) => {
	return (
		<div className={`${showAtEnd ? 'd-flex justify-content-end' : ''}`}>
			<Button
				size={size}
				variant={variant}
				disabled={!isValid || isSubmitting}
				onClick={onClick}
				className={`btn ${block ? 'btn-block' : ''} ${className || ''}`}
				type={type}
				style={style}
			>
				{icon && <i className={icon}></i>}
				{isSubmitting ? 'Loading…' : text || children}
			</Button>
		</div>
	);
};

export default CustomButton;
