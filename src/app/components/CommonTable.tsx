import React from 'react';
import { Spinner, Table } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import CustomButton from './CustomButton';
import AppPagination from './AppPagination';
import { MetaData } from '../models/pagination';
import { useAppSelector } from '../store/configureStore';
import { selectTableLoading } from '../layout/loadingSlice';

interface DataType {
    [key: string]: any;
}

interface CommonTableProps<T extends DataType> {
    data: T[];
    columns: ColumnDef<T>[];
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    showSrNo?: boolean;
    usePagination?: boolean;
    metaData?: MetaData;
    onPageChange?: (page: number) => void;
    onRowClick?: (row: T) => void;

}

const CommonTable = <T extends DataType>({
    data,
    columns,
    onEdit,
    onDelete,
    showSrNo = false,
    usePagination = false,
    metaData,
    onPageChange,
    onRowClick,

}: CommonTableProps<T>) => {
    const tableLoading = useAppSelector(selectTableLoading);

    const calculateSrNo = (rowIndex: number): number => {
        if (!metaData) return rowIndex + 1;
        return (metaData.currentPage - 1) * metaData.pageSize + rowIndex + 1;
    };

    const enhancedColumns = React.useMemo(() => {
        let baseColumns = showSrNo ? [
            {
                id: 'srNo',
                header: () => 'Sr. No',
                cell: (info: any) => calculateSrNo(info.row.index),
            },
            ...columns,
        ] : columns;

        if (onEdit || onDelete) {
            baseColumns.push({
                id: 'actions',
                header: () => '',
                cell: info => (
                    <div className="d-flex gap-2 justify-content-end">
                        {onEdit && <CustomButton variant="outline-primary" size="sm"
                            onClick={(event) => {
                                event.stopPropagation();
                                onEdit(info.row.original);
                            }}
                            icon="bi bi-pencil-square" text={''} />}
                        {onDelete && <CustomButton variant="outline-danger" size="sm"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete(info.row.original);
                            }} icon="bi bi-trash" text={''} />}
                    </div>
                ),
            });
        }

        return baseColumns;
    }, [columns, showSrNo, onEdit, onDelete, calculateSrNo]);

    const tableInstance = useReactTable<T>({
        data,
        columns: enhancedColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const getTextAlignStyle = React.useCallback((columnId: string): React.CSSProperties => {
        const rightAlignedKeywords = ['balance', 'bal', 'amount', 'amt', 'debit', 'credit', 'expense'];
        const columnIdLower = columnId.toLowerCase();
        const isRightAligned = rightAlignedKeywords.some(keyword => columnIdLower.includes(keyword.toLowerCase()));
        return { textAlign: isRightAligned ? 'right' : 'left' };
    }, []);

    return (
        <>
            <div className="custom-table-container">
                <Table striped bordered hover className="custom-table">
                    <thead>
                        {tableInstance.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} style={getTextAlignStyle(header.id)}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {tableLoading ? (
                            <tr>
                                <td colSpan={enhancedColumns.length} className="text-center">
                                    <Spinner animation="border" />
                                </td>
                            </tr>
                        ) : (
                            tableInstance.getRowModel().rows.map(row => (
                                <tr key={row.id}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} style={getTextAlignStyle(cell.column.id)}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
            {
                usePagination && metaData && onPageChange && (
                    <div className='mt-2'>
                        <AppPagination metaData={metaData} onPageChange={onPageChange} />

                    </div>
                )
            }

        </>
    );
};

export default CommonTable;
