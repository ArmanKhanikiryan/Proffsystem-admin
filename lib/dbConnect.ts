import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

async function dbConnect() {
    await mongoose.connect(MONGODB_URI);
}
export default dbConnect;

dbConnect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));
