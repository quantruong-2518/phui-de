export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
