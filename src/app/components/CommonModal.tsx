import React, { ReactNode } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';

interface CommonModalProps extends ModalProps {
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'lg' | 'xl';
}

const CommonModal: React.FC<CommonModalProps> = ({ show, onHide, title = "", children, size = 'sm', ...rest }) => {
    return (

        <Modal autoFocus enforceFocus show={show} onHide={onHide} size={size} {...rest} centered >
            <Modal.Body className="p-0">{children}</Modal.Body>
        </Modal>

    );
};

export default CommonModal;
