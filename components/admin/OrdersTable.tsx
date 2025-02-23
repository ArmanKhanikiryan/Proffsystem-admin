'use client';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {DataTable, DataTableFilterMeta} from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode } from 'primereact/api';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import { fetchOrders } from '@/lib/api';

interface Filters {
    global: { value: string | null; matchMode: FilterMatchMode };
    customerName: { value: string | null; matchMode: FilterMatchMode };
    date: { value: string[] | null; matchMode: FilterMatchMode };
}

export default function OrdersTable() {
    const { data, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
    });

    const [filters, setFilters] = useState<Filters>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customerName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        date: { value: [], matchMode: FilterMatchMode.IN },
    });

    const [uniqueDates, setUniqueDates] = useState<string[]>([]);

    useEffect(() => {
        if (data?.orders) {
            const dates = [
                ...new Set(
                    data.orders
                        .map((order: any) => order.date)
                        .filter((date: any) => date != null)
                        .map((date: any) => String(date))
                ),
            ];
            setUniqueDates(dates as any);
        }
    }, [data]);

    const onCustomerNameFilter = (e: any) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters.customerName.value = value;
        setFilters(_filters);
    };

    const onDateFilter = (e: any) => {
        const _filters = { ...filters };
        _filters.date.value = e.value || [];
        setFilters(_filters);
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-wrap gap-4">
                <InputText
                    placeholder="Որոնել ըստ անվան"
                    className="p-inputtext-sm"
                    onChange={onCustomerNameFilter}
                />
                <MultiSelect
                    options={uniqueDates.map((date) => ({ label: date, value: date }))}
                    value={filters.date.value}
                    placeholder="Ընտրեք ամսաթիվ"
                    onChange={onDateFilter}
                    className="p-multiselect-sm"
                    display="chip"
                />
            </div>
        );
    };

    const itemsBodyTemplate = (rowData: any) => {
        return (
            <div className="space-y-1">
                {rowData.items.map((item: any, index: number) => (
                    <div key={index} className="text-sm">
                        <span className="font-medium">Տեսակ: </span>
                        {item.type}
                        {item.color && (
                            <>
                                , <span className="font-medium">Գույն: </span>
                                {item.color}
                            </>
                        )}
                        <br />
                        <span className="font-medium">Քանակ: </span>
                        {item.quantity} մետր
                        <br />
                        <span className="font-medium">Միավորի գին: </span>
                        {item.pricePerUnit?.toLocaleString()} AMD
                    </div>
                ))}
            </div>
        );
    };

    const totalBodyTemplate = (rowData: any) => {
        return <div className="font-semibold">{rowData.total.toLocaleString()} AMD</div>;
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-semibold mb-2">Պատվերների Պատմություն</h2>
            {isLoading ? (
                <p>Բեռնվում է...</p>
            ) : (
                <DataTable
                    value={data?.orders || []}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    filters={filters as unknown as DataTableFilterMeta}
                    globalFilterFields={['customerName', 'date', 'total']}
                    header={renderHeader}
                    emptyMessage="Պատվերներ չեն գտնվել"
                    className="p-datatable-striped"
                >
                    <Column
                        field="customerName"
                        header="Հաճախորդ"
                        filter
                        filterPlaceholder="Որոնել ըստ անվան"
                    />
                    <Column
                        field="date"
                        header="Ամսաթիվ"
                        filter
                        filterField="date"
                        filterElement={(options) => (
                            <MultiSelect
                                value={options.value || []}
                                options={uniqueDates.map((date) => ({ label: date, value: date }))}
                                onChange={(e) => options.filterCallback(e.value || [])}
                                placeholder="Ընտրեք ամսաթիվ"
                                className="p-column-filter"
                            />
                        )}
                    />
                    <Column header="Ապրանքներ" body={itemsBodyTemplate} style={{ minWidth: '300px' }} />
                    <Column header="Ընդհանուր" body={totalBodyTemplate} style={{ minWidth: '150px' }} />
                </DataTable>
            )}
        </div>
    );
}
