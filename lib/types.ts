export type Element = {
    id?: number;
    color: string;
    type: string;
    price: number;
    quantity: number;
};

export type OrderElement = {
    type: string;
    color: string | undefined;
    quantity: number;
    pricePerUnit: number;
}


export type FetchElementsResponse = {
    elements: Element[];
};

export type DeletePayload = {
    type: string,
    color: string | null
}

export type OrderPayload = {
    items: OrderElement[],
    customerName: string,
    total: number
}
