import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
