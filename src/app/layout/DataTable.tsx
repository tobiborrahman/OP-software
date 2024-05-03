import { Table as BTable } from 'react-bootstrap';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

// Common table props
type CommonTableProps<T extends object> = {
    columns: ColumnDef<T>[];
    data: T[];
};

function CommonTable<T extends object>({ columns, data }: CommonTableProps<T>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <BTable striped bordered hover responsive size="sm">
            <thead>
                {table.getHeaderGroups().map((headerGroup: any) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header: any) => (
                            <th key={header.id} colSpan={header.colSpan}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map((row: any) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell: any) => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </BTable>
    );
}

export default CommonTable;
