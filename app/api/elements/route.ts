import { NextResponse } from 'next/server';
import {IInventoryElement, InventoryElement} from "@/models/InventoryElement";
import dbConnect from "@/lib/dbConnect";
import {DeletePayload} from "@/lib/types";

export async function GET() {
    try {
        await dbConnect();
        const elements: IInventoryElement[] = await InventoryElement.find({});
        return NextResponse.json({ elements });
    } catch (error) {
        console.error(error)
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
        console.error(error)
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const payload = await request.json();
        const { type, color } = payload as DeletePayload;

        if (!type) {
            return NextResponse.json({ success: false, error: 'Type is required' }, { status: 400 });
        }

        let deletedElement
        if(!color) {
            deletedElement = await InventoryElement.findOneAndDelete({ type });
            if (!deletedElement) {
                return NextResponse.json({ success: false, error: 'Element not found' }, { status: 404 });
            }
        } else {
            deletedElement = await InventoryElement.findOneAndDelete({ type, color });
            if (!deletedElement) {
                return NextResponse.json({ success: false, error: 'Element not found' }, { status: 404 });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Element deleted successfully',
            element: deletedElement,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to delete element' }, { status: 500 });
    }
}
