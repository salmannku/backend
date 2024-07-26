export interface IResponse<T> {
    message: string;
    statusCode: number;
    error: string;
    success: boolean;
    errors: Record<any, any>;
    data: T | null;
  }
  