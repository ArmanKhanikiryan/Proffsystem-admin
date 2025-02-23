'use client';
import {FormEvent, useCallback, useEffect, useState} from 'react';
import type { Element } from "@/lib/types";
import {
    QueryClient,
    QueryClientProvider,
    HydrationBoundary as Hydrate,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { addElement } from '@/lib/api';
import { colorOptions, typeOptions } from "@/lib/constants";
import AdminTable from "@/components/admin/CustomTable";
import CalculateItem from "@/components/admin/CalculateItem";

type AdminPanelProps = {
    dehydratedState: unknown;
};

export default function Panel({ dehydratedState }: AdminPanelProps) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <Hydrate state={dehydratedState}>
                <AdminPanelContent/>
            </Hydrate>
        </QueryClientProvider>
    );
}

function AdminPanelContent() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: addElement,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['elements'] }),
    });

    const [formData, setFormData] = useState<Omit<Element, 'price'>>({
        color: '',
        type: '',
        quantity: 0,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const selectedItem:any = typeOptions.find((elem) => elem.type === formData.type)
        const price = selectedItem.priceOptions[formData.color]
        mutation.mutate({...formData, price: price * formData.quantity});
        setFormData({ color: '', type: '', quantity: 0 });
    };

    useEffect(() => {
        if(formData.type.includes('Երկաթ')) {
            setFormData({...formData, color: ''})
        }
    }, [formData.type])

    const disabledCondition = useCallback(() => {
        if(formData.type.includes('Երկաթ')) {
            return !formData.type || !formData.quantity
        }
        return !formData.type || !formData.quantity || !formData.color
    }, [formData])

    return (
        <div className="p-4 space-y-6">
            <Card className="p-4">
                <h1 className="text-2xl font-bold mb-4">Ավելացնել Ապրանք</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Տեսակ</label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({...formData, type: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Ընտրեք Տեսակը"/>
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    typeOptions.map((elem, index) => {
                                        return <SelectItem key={index} value={elem.type}>{elem.type}</SelectItem>
                                    })
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Գույն</label>
                        <Select
                            disabled={formData.type.includes('Երկաթ')}
                            value={formData.color}
                            onValueChange={(value) => setFormData({...formData, color: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Ընտրեք Գույնը"/>
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    colorOptions.map((color, index) => {
                                        return <SelectItem key={index} value={color}>{color}</SelectItem>
                                    })
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Մետր</label>
                        <Input
                            type="quantity"
                            placeholder="Գրեք քանի մետր"
                            value={formData.quantity}
                            onChange={(e) =>{
                                const newValue = Number(e.target.value);
                                if (!isNaN(newValue)) {
                                    setFormData({ ...formData, quantity: newValue });
                                }
                            }}
                        />
                    </div>
                    <Button type="submit" disabled={disabledCondition()} className="mt-4">
                        Ավելացնել Ապրանք
                    </Button>
                </form>
            </Card>

            <Card className="p-4">
                <AdminTable/>
            </Card>

            <Card className="p-4">
                <h1 className="text-2xl font-bold mb-4">Արժեքի Հաշվիչ</h1>
                <CalculateItem />
            </Card>
        </div>
    );
}
