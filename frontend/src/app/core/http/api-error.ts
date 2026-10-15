import { HttpErrorResponse } from '@angular/common/http';

/**
 * Lấy danh sách thông báo lỗi từ response của API. Backend trả lỗi theo 3 dạng:
 * - chuỗi: Unauthorized("..."), Conflict("...")
 * - mảng chuỗi: BadRequest(result.Errors...)
 * - ProblemDetails có `errors` (lỗi validate của [ApiController])
 */
export const getApiErrors = (error: unknown): string[] => {
  if (!(error instanceof HttpErrorResponse)) {
    return ['Đã có lỗi xảy ra. Vui lòng thử lại.'];
  }
  if (error.status === 0) {
    return ['Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.'];
  }

  const body: unknown = error.error;
  if (typeof body === 'string' && body.trim()) {
    return [body];
  }
  if (Array.isArray(body) && body.length) {
    return body.map(String);
  }
  if (body && typeof body === 'object' && 'errors' in body && body.errors) {
    return Object.values(body.errors as Record<string, string[]>).flat();
  }
  return ['Đã có lỗi xảy ra. Vui lòng thử lại.'];
};
