import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const cloudinaryService = new CloudinaryService();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        errorResponse('No file provided', 'BAD_REQUEST'),
        { status: 400 }
      );
    }
    
    const result = await cloudinaryService.uploadImage(file);
    
    return NextResponse.json(successResponse(result, 'Image uploaded successfully'));
  } catch (error) {
    return handleError(error);
  }
}