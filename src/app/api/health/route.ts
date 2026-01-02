import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/config/database';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Database connected successfully',
      mongodb: 'connected'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    }, { status: 500 });
  }
}
