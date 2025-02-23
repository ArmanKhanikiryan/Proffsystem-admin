import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { InventoryElement } from '@/models/InventoryElement';
import Order from '@/models/Order';
import mongoose from 'mongoose';


export async function POST(request: Request) {
    try {
        const { customerName, items: orderItems, total } = await request.json();
        await dbConnect();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            for (const item of orderItems) {
                const query = item.type.includes('Երկաթ')
                    ? { type: item.type }
                    : { type: item.type, color: item.color };

                const inventoryElement = await InventoryElement.findOne(query).session(session);

                if (!inventoryElement || inventoryElement.quantity < item.quantity) {
                    throw new Error(`Անբավարար քանակ ${item.type}${item.color ? ' ' + item.color : ''}`);
                }

                inventoryElement.quantity -= item.quantity;

                if (inventoryElement.quantity === 0) {
                    await InventoryElement.deleteOne({ _id: inventoryElement._id }).session(session);
                } else {
                    await inventoryElement.save({ session });
                }
            }

            const order = new Order({
                customerName,
                items: orderItems,
                total,
                date: new Date()
            });

            await order.save({ session });

            await session.commitTransaction();

            return NextResponse.json({
                success: true,
                order: {
                    ...order.toObject(),
                    date: new Date().toLocaleDateString('en-US', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit'
                    })
                }
            });

        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Order submission error:', error);
        return NextResponse.json(
            { success: false, error: error },
            { status: 400 }
        );
    }
}


export async function GET() {
    try {
        await dbConnect();
        const orders = await Order.find({}).sort({ date: -1 });

        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            date: new Date(order.date).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit'
            })
        }));

        return NextResponse.json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
