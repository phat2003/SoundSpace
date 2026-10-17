// Kiểu dữ liệu khớp với các model trong backend/SoundSpace.Core/Models/Auth.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthenticatedResult {
  token: string;
  refreshToken: string;
}

/** Thông tin người dùng đọc từ access token (JWT), đủ để hiển thị header và kiểm tra quyền. */
export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  roles: string[];
}
