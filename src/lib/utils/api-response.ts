import { ApiSuccessResponseDTO, ApiErrorResponseDTO } from '../dto/response/api.dto';

export function successResponse<T>(data: T, message?: string): ApiSuccessResponseDTO<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(
  message: string,
  code?: string,
  details?: any
): ApiErrorResponseDTO {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}