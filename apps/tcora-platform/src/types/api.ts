  // apps/platform/src/types/api.ts
  export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, any>;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
  }