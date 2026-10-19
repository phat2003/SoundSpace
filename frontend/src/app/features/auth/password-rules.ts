import { minLength, pattern, required, SchemaPath } from '@angular/forms/signals';

/**
 * Quy tắc mật khẩu giống cấu hình Identity trong backend (Program.cs): ít nhất 8 ký tự,
 * có chữ hoa, chữ thường, chữ số, ký tự đặc biệt. Dùng chung cho form Đăng ký và Đổi mật khẩu.
 */
export const passwordRules = (path: SchemaPath<string>) => {
  required(path, { message: 'Vui lòng nhập mật khẩu.' });
  minLength(path, 8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
  pattern(path, /[A-Z]/, { message: 'Mật khẩu phải có ít nhất một chữ hoa (A-Z).' });
  pattern(path, /[a-z]/, { message: 'Mật khẩu phải có ít nhất một chữ thường (a-z).' });
  pattern(path, /[0-9]/, { message: 'Mật khẩu phải có ít nhất một chữ số (0-9).' });
  pattern(path, /[^a-zA-Z0-9]/, {
    message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (ví dụ @, #, $).',
  });
};
