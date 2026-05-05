export type ApiResponse<T> = {
  status: "success" | "error";
  statusCode: number;
  timestamp: Date;
  data?: T;
  errors?: ApiError[];
  message: string;
};

export type ApiError = {
  field: string;
  message: string;
};
