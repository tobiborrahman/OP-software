import React from 'react';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';

interface LabelProps {
    htmlFor?: string;
    label: string;
    required?: boolean;
    className?: string;
    badgeText?: string;
    badgeStyle?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

const CustomLabel: React.FC<LabelProps> = ({
    htmlFor,
    label,
    required,
    className,
    badgeText,
    badgeStyle = 'success'
}) => {
    return (
        <div className="d-flex justify-content-start align-items-center w-100">
            <Form.Label htmlFor={htmlFor} className={`app-label mt-1 mb-1 ${className || ''} flex-grow-1`}>
                {label}
                {label && required && <span style={{ color: 'red' }}>&nbsp;*</span>}
            </Form.Label>
            {badgeText && (
                <Badge
                    bg={badgeStyle}
                    style={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                    {badgeText}
                </Badge>
            )}
        </div>

    );
};

export default CustomLabel;
