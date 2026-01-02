export interface ApiSuccessResponseDTO<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponseDTO {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export type ApiResponseDTO<T = any> = ApiSuccessResponseDTO<T> | ApiErrorResponseDTO;
