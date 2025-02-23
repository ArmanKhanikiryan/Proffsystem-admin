import {FetchElementsResponse, Element, DeletePayload, OrderPayload} from "@/lib/types";

export const fetchElements = async (): Promise<FetchElementsResponse> => {
    const res = await fetch('/api/elements');
    if (!res.ok) throw new Error('Error fetching elements');
    return res.json();
};

export const addElement = async (element: Element) => {
    const res = await fetch('/api/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(element),
    });
    if (!res.ok) throw new Error('Error adding element');
    return res.json();
};


export const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
};


export const deleteElement = async  (payload: DeletePayload): Promise<void> => {
    const response = await fetch('/api/elements', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete element');
    }
}

export const orderItems = async ({customerName, items, total}: OrderPayload): Promise<void> =>  {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, items, total }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
    }
}
