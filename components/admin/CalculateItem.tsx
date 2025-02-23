'use client';
import {FormEvent, useState} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { typeOptions, colorOptions } from "@/lib/constants";
import { Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import {Label} from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderItems } from "@/lib/api";
import {OrderPayload} from "@/lib/types";


type CalculatorItem = {
    id: number;
    type: string;
    color: string;
    quantity: number;
};

export default function CalculateItem() {
    const queryClient = useQueryClient()
    const [items, setItems] = useState<CalculatorItem[]>([{
        id: Date.now(),
        type: '',
        color: '',
        quantity: 0
    }]);
    const [customerName, setCustomerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const addItem = () => {
        setItems(prev => [...prev, {
            id: Date.now(),
            type: '',
            color: '',
            quantity: 0
        }]);
    };

    const deleteItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id: number, updates: Partial<CalculatorItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const calculateBlockPrice = (item: CalculatorItem) => {
        const typeConfig = typeOptions.find(opt => opt.type === item.type);
        if (!typeConfig) return 0;

        const price = item.type.includes('Երկաթ')
            ? typeConfig.priceOptions.default
            // @ts-expect-error - color is always defined
            : typeConfig.priceOptions[item.color] || 0;

        return price * item.quantity;
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + calculateBlockPrice(item), 0);
    };

    const orderMutation = useMutation({
        mutationFn: (payload: OrderPayload) => orderItems(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['elements'] });
            setIsDialogOpen(false);
            setItems([{ id: Date.now(), type: '', color: '', quantity: 0 }]);
            setCustomerName('');
            toast.success('Պատվերը հաջողությամբ կատարված է');
        },
        onError: (error) => {
            console.error('Error submitting order:', error);
            toast.error('Սխալ պատվերի ձևակերպման ընթացքում');
        },
    });


    const handleSubmitOrder = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (items.some(item => item.quantity <= 0)) {
            toast.error('Խնդրում ենք լրացնել բոլոր դաշտերը ճիշտ');
            setIsSubmitting(false);
            return;
        }

        const isValid = items.every(item => {
            if (item.type === '') return false;
            return !(!item.type.includes('Երկաթ') && item.color === '');

        });

        if (!isValid) {
            toast.error('Խնդրում ենք ընտրել տեսակը և գույնը բոլոր բլոկների համար');
            setIsSubmitting(false);
            return;
        }

        const orderItems = items.map(item => {
            const pricePerUnit = calculateBlockPrice(item) / item.quantity;
            return {
                type: item.type,
                color: item.type.includes('Երկաթ') ? undefined : item.color,
                quantity: item.quantity,
                pricePerUnit,
            };
        });

        const total = calculateTotal();

        try {
            await orderMutation.mutateAsync({
                customerName,
                items: orderItems,
                total
            });
            toast.success('Պատվերը հաջողությամբ կատարված է');
            setIsDialogOpen(false);
            setItems([{ id: Date.now(), type: '', color: '', quantity: 0 }]);
            setCustomerName('');
        } catch (_) {
            toast.error('Սխալ պատվերի ձևակերպման ընթացքում');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Բլոկ #{items.indexOf(item) + 1}</h3>
                        <Button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            variant="destructive"
                            size="sm"
                        >
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Տեսակ</label>
                        <Select
                            value={item.type}
                            onValueChange={value => updateItem(item.id, {
                                type: value,
                                color: value.includes('Երկաթ') ? '' : item.color
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Ընտրեք տեսակը" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.type} value={option.type}>
                                        {option.type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!item.type.includes('Երկաթ') && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Գույն</label>
                            <Select
                                value={item.color}
                                onValueChange={value => updateItem(item.id, { color: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Ընտրեք գույնը" />
                                </SelectTrigger>
                                <SelectContent>
                                    {colorOptions.map((color) => (
                                        <SelectItem key={color} value={color}>
                                            {color}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Մետր</label>
                        <Input
                            type="number"
                            min={0}
                            value={item.quantity}
                            onChange={e => updateItem(item.id, {
                                quantity: Number(e.target.value)
                            })}
                        />
                    </div>

                    <div className="text-lg font-semibold">
                        Արժեք: {calculateBlockPrice(item).toLocaleString()} AMD
                    </div>
                </div>
            ))}

            <Button
                type="button"
                onClick={addItem}
                variant="outline"
                className="w-full"
            >
                <Plus className="w-4 h-4 mr-2" />
                Ավելացնել նոր տարր
            </Button>

            <div className="text-xl font-semibold pt-4 border-t">
                Ընդհանուր արժեք: {calculateTotal().toLocaleString()} AMD
            </div>


            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full mt-4">Հաստատել ապրանքը</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Պատվերի ձևակերպում</DialogTitle>
                        <DialogDescription>
                            Խնդրում ենք մուտքագրել ձեր անունը պատվերը հաստատելու համար
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitOrder}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Անուն</Label>
                                <Input
                                    id="name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="submit" disabled={!customerName}>
                                {isSubmitting ? 'Բեռնվում է...' : 'Հաստատել'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
