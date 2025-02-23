export type Element = {
    id?: number;
    color: string;
    type: string;
    price: number;
    quantity: number;
};

export type FetchElementsResponse = {
    elements: Element[];
};
