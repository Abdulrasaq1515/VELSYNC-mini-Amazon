import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { registerSchema } from '@/lib/validators/auth.validator';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const validatedData = registerSchema.parse(body);
    
    // Register user
    const result = await authService.register(validatedData);
    
    return NextResponse.json(successResponse(result, 'Registration successful'), {
      status: 201,
    });
  } catch (error) {
    return handleError(error);
  }
}
