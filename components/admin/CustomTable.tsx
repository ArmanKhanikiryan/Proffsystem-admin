'use client';
import { ChangeEvent, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode } from 'primereact/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colorOptions, typeOptions } from '@/lib/constants';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import { fetchElements, deleteElement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {DeletePayload} from "@/lib/types";

type Element = {
    id?: number;
    color: string;
    type: string;
    price: number;
    quantity: number;
};

export default function AdminTable() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['elements'],
        queryFn: fetchElements,
        staleTime: 1000 * 60 * 5,
    });

    const deleteMutation = useMutation({
        mutationFn: (payload: DeletePayload) => deleteElement(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elements'] });
        },
        onError: (error) => {
            console.error('Error deleting element:', error);
            alert('Failed to delete element. Please try again.');
        },
    });

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        color: { value: null, matchMode: FilterMatchMode.IN },
        type: { value: null, matchMode: FilterMatchMode.IN },
        price: { value: null, matchMode: FilterMatchMode.EQUALS },
        quantity: { value: null, matchMode: FilterMatchMode.EQUALS },
    });

    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const _filters = { ...filters };
        //@ts-expect-error - global filter is always defined
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const totalPrice =
        data?.elements?.reduce((acc: number, el: Element) => {
            return acc + el.price;
        }, 0) || 0;

    const renderHeader = () => {
        return (
            <div className="flex justify-between">
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Global Search"
                    className="p-2 border rounded"
                />
            </div>
        );
    };

    const colorFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <MultiSelect
                value={options.value}
                options={colorOptions.map((color) => ({ label: color, value: color }))} // Ensure options have label/value
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Colors"
                className="p-column-filter"
            />
        );
    };

    const typeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <MultiSelect
                value={options.value}
                options={typeOptions.map(({ type }) => ({
                    label: type,
                    value: type,
                }))}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Types"
                className="p-column-filter"
            />
        );
    };

    const priceFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <InputText
                type="number"
                value={options.value || ''} // Use empty string instead of null
                onChange={(e) => options.filterCallback(e.target.value)}
                placeholder="Search by Price"
                className="p-column-filter"
            />
        );
    };

    const quantityFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <InputText
                type="number"
                value={options.value || ''} // Use empty string instead of null
                onChange={(e) => options.filterCallback(e.target.value)}
                placeholder="Search by Quantity"
                className="p-column-filter"
            />
        );
    };

    const deleteBodyTemplate = (rowData: Element) => {
        return (
            <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                    const payload = { type: rowData.type, color: rowData.color ? rowData.color : null };
                    deleteMutation.mutate(payload);
                }}
                disabled={deleteMutation.isPending}
            >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
        );
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-semibold mb-2">Ապրանքների Ցուցակ</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <DataTable
                    value={data?.elements || []}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    filters={filters}
                    globalFilterFields={['color', 'type', 'price', 'quantity']}
                    header={renderHeader}
                    emptyMessage="No elements found."
                    className="p-datatable-striped"
                    removableSort
                >
                    <Column
                        field="type"
                        header="Տեսակ"
                        sortable
                        filter
                        filterElement={typeFilterTemplate}
                    />
                    <Column
                        field="color"
                        header="Գույն"
                        sortable
                        filter
                        filterElement={colorFilterTemplate}
                    />
                    <Column
                        field="price"
                        header="Գին"
                        sortable
                        filter
                        filterElement={priceFilterTemplate}
                    />
                    <Column
                        field="quantity"
                        header="Մետր"
                        sortable
                        filter
                        filterElement={quantityFilterTemplate}
                    />
                    <Column
                        header="Actions"
                        body={deleteBodyTemplate}
                        style={{ width: '100px' }}
                    />
                </DataTable>
            )}
            <div className="mt-4">
                <p className="font-bold">
                    Ընդհանուր ապրանքների քանակը: {totalPrice} դրամ
                </p>
            </div>
        </div>
    );
}
