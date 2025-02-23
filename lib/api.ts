import { FetchElementsResponse, Element } from "@/lib/types";

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
