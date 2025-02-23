import { NextResponse } from 'next/server';
import {IInventoryElement, InventoryElement} from "@/models/InventoryElement";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
    try {
        await dbConnect();
        const elements: IInventoryElement[] = await InventoryElement.find({});
        return NextResponse.json({ elements });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to load elements' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const newElement = await request.json();

        let query = {};
        if (newElement.type.includes('Երկաթ')) {
            query = { type: newElement.type };
        } else {
            query = { color: newElement.color, type: newElement.type };
        }

        const existingElement = await InventoryElement.findOne(query);

        if (existingElement) {
            existingElement.quantity += newElement.quantity;
            existingElement.price += newElement.price;
            await existingElement.save();
            return NextResponse.json({
                success: true,
                element: existingElement,
                message: 'Element quantity updated'
            });
        } else {
            const createdElement = await InventoryElement.create(newElement);
            return NextResponse.json({
                success: true,
                element: createdElement,
                message: 'New element added'
            });
        }
    } catch (error) {
        console.log(error, 123123123123)
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
    }
}
