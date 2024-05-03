import React from 'react';
import Pagination from 'react-bootstrap/Pagination';
import { MetaData } from '../models/pagination'; // Adjust the import path as necessary

interface AppPaginationProps {
    metaData: MetaData;
    onPageChange: (page: number) => void;
}

const AppPagination: React.FC<AppPaginationProps> = ({ metaData, onPageChange }) => {
    const {  currentPage,  totalPages } = metaData;

    // Dynamic Pagination Logic
    const items = [];
    const visiblePages = 5; // Number of pages to display in the pagination component
    let startPage: number = currentPage - Math.floor(visiblePages / 2);
    startPage = Math.max(startPage, 1);
    let endPage: number = startPage + visiblePages - 1;
    endPage = Math.min(endPage, totalPages);

    if (endPage - startPage < visiblePages - 1) {
        startPage = Math.max(endPage - visiblePages + 1, 1);
    }

    // First and Previous Buttons
    items.push(<Pagination.First key="first" onClick={() => onPageChange(1)} disabled={currentPage === 1} />);
    items.push(<Pagination.Prev key="prev" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />);

    // Leading Ellipsis
    if (startPage > 1) {
        items.push(<Pagination.Item key="1" onClick={() => onPageChange(1)}>{1}</Pagination.Item>);
        if (startPage > 2) {
            items.push(<Pagination.Ellipsis key="startEllipsis" />);
        }
    }

    // Page Numbers
    for (let number = startPage; number <= endPage; number++) {
        items.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={() => onPageChange(number)}>
                {number}
            </Pagination.Item>
        );
    }

    // Trailing Ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            items.push(<Pagination.Ellipsis key="endEllipsis" />);
        }
        items.push(<Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>{totalPages}</Pagination.Item>);
    }

    // Next and Last Buttons
    items.push(<Pagination.Next key="next" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
    items.push(<Pagination.Last key="last" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />);

    return <div className="d-flex justify-content-end">
        <Pagination>{items}</Pagination>
    </div>
};

export default AppPagination;
