import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from "@/models/User";
import dbConnect from "@/lib/dbConnect";

await dbConnect();
export async function POST(request: Request) {
    const { username, password } = await request.json();
    const user = await User.findOne({ username, password });
    if (!user) {
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const token = jwt.sign({ username: user.username }, secret, { expiresIn: '1h' });

    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
        path: '/'
    });

    return response;
}
