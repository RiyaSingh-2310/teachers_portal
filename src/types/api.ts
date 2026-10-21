export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}
