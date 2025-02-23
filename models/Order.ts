import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    items: [{
        type: { type: String, required: true },
        color: String,
        quantity: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true },
    }],
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
