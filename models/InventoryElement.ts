import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryElement extends Document {
    color: string;
    type: string;
    price: number;
    quantity: number;
}

const InventoryElementSchema: Schema = new Schema({
    color: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, {
    timestamps: true,
});

export const InventoryElement: Model<IInventoryElement> =
    mongoose.models.InventoryElement ||
    mongoose.model<IInventoryElement>('InventoryElement', InventoryElementSchema);
