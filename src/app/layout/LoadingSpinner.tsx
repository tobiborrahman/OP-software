import React from 'react';
import { Spinner } from 'react-bootstrap';
import { selectLoading } from './loadingSlice';
import { useAppSelector } from '../store/configureStore';
import { CSSProperties } from 'react'; // Import CSSProperties

interface LoadingSpinnerProps {
    isModal?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isModal = false }) => {
    const isLoading = useAppSelector(selectLoading);
    if (!isLoading) return null;

    // Define spinnerStyle as CSSProperties to ensure correct typing
    const spinnerStyle: CSSProperties = isModal ? {
        position: 'absolute', // Correctly typed
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // Center the spinner in the modal
        zIndex: 1050, // Ensure it's above modal content
    } : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed', // Correctly typed
        top: '40%', // Adjust this value to move the spinner up or down for non-modal loading
        left: 0,
        right: 0,
        zIndex: 1000, // Ensure the spinner is above other non-modal content
    };

    return (
        <div style={spinnerStyle}>
            <Spinner animation="border" variant="primary" />
        </div>
    );
};

export default LoadingSpinner;
