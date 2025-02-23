'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { typeOptions, colorOptions } from "@/lib/constants";
import { Plus, Trash } from 'lucide-react';

type CalculatorItem = {
    id: number;
    type: string;
    color: string;
    quantity: number;
};

export default function CalculateItem() {
    const [items, setItems] = useState<CalculatorItem[]>([{
        id: Date.now(),
        type: '',
        color: '',
        quantity: 0
    }]);

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
            // @ts-ignore
            : typeConfig.priceOptions[item.color] || 0;

        return price * item.quantity;
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + calculateBlockPrice(item), 0);
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
        </div>
    );
}
