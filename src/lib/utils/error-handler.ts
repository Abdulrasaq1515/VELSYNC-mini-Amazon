import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { errorResponse } from './api-response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): NextResponse {
  console.error('Error:', error);

  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      errorResponse('Validation error', 'VALIDATION_ERROR', error.errors),
      { status: 400 }
    );
  }

  // Custom app error
  if (error instanceof AppError) {
    return NextResponse.json(
      errorResponse(error.message, error.code),
      { status: error.statusCode }
    );
  }

  // Mongoose validation error
  if ((error as any).name === 'ValidationError') {
    return NextResponse.json(
      errorResponse('Validation error', 'VALIDATION_ERROR', (error as any).errors),
      { status: 400 }
    );
  }

  // Mongoose duplicate key error
  if ((error as any).code === 11000) {
    return NextResponse.json(
      errorResponse('Duplicate entry', 'DUPLICATE_ERROR'),
      { status: 409 }
    );
  }

  // Default error
  return NextResponse.json(
    errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      'INTERNAL_ERROR'
    ),
    { status: 500 }
  );
}