// Client-safe response envelope for server actions
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { type: string; message: string } };

// Unwrap an ApiResponse or throw — use in React Query mutation onSuccess handlers
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.success) return response.data;
  throw new Error(`[${response.error.type}] ${response.error.message}`);
}
