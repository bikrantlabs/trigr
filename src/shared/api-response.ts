export type ApiResponse<T> = {
  status: "success" | "error";
  timestamp: Date;
  data?: T;
  errors?: ApiError[];
  message: string;
};

export type ApiError = {
  field: string;
  message: string;
};
