'use client';
import {ChangeEvent, useState} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode } from 'primereact/api';
import { useQuery } from '@tanstack/react-query';
import { colorOptions, typeOptions } from '@/lib/constants';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import {fetchElements} from "@/lib/api";

type Element = {
    id?: number;
    color: string;
    type: string;
    price: number;
    quantity: number;
};

export default function AdminTable() {
    const { data, isLoading } = useQuery({
        queryKey: ['elements'],
        queryFn: fetchElements,
        staleTime: 1000 * 60 * 5,
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
        let _filters = { ...filters };
        // @ts-ignore
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const totalPrice =
        data?.elements?.reduce(
            (acc: number, el: Element) => {
                return acc + el.price
            },
            0
        ) || 0;

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

    const colorFilterTemplate = (options: any) => {
        return (
            <MultiSelect
                value={options.value}
                options={colorOptions}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Colors"
                className="p-column-filter"
            />
        );
    };

    const typeFilterTemplate = (options: any) => {
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

    const priceFilterTemplate = (options: any) => {
        return (
            <InputText
                type="number"
                value={options.value}
                onChange={(e) => options.filterCallback(e.target.value)}
                placeholder="Search by Price"
                className="p-column-filter"
            />
        );
    };

    const quantityFilterTemplate = (options: any) => {
        return (
            <InputText
                type="number"
                value={options.value}
                onChange={(e) => options.filterCallback(e.target.value)}
                placeholder="Search by Quantity"
                className="p-column-filter"
            />
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
