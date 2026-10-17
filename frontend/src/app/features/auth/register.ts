import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { getApiErrors } from '../../core/http/api-error';
import { AuthCard } from './auth-card';
import { FieldError } from './field-error';
import { FormAlert } from './form-alert';

@Component({
  selector: 'app-register',
  imports: [AuthCard, FieldError, FormAlert, FormField, FormRoot],
  template: `
    <app-auth-card>
      <div>
        <h1 class="mb-2 font-headline-lg text-on-surface">Tạo tài khoản mới</h1>
        <p class="text-body-md text-on-surface-variant">
          Khám phá kho tàng âm nhạc đỉnh cao miễn phí.
        </p>
      </div>

      <form [formRoot]="registerForm" class="space-y-4">
        <div class="space-y-1">
          <label for="register-name" class="text-label-md text-on-surface-variant">Họ và tên</label>
          <div class="relative">
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg! leading-none! text-outline"
              aria-hidden="true"
              >person</span
            >
            <input
              id="register-name"
              type="text"
              autocomplete="name"
              placeholder="Nguyễn Văn A"
              [formField]="registerForm.fullName"
              [attr.aria-invalid]="
                registerForm.fullName().touched() && registerForm.fullName().invalid()
              "
              aria-describedby="register-name-error"
              class="w-full rounded-xl bg-surface-container-low py-3 pr-4 pl-11 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
            />
          </div>
          <app-field-error [field]="registerForm.fullName" id="register-name-error" />
        </div>

        <div class="space-y-1">
          <label for="register-email" class="text-label-md text-on-surface-variant">Email</label>
          <div class="relative">
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg! leading-none! text-outline"
              aria-hidden="true"
              >mail</span
            >
            <input
              id="register-email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              [formField]="registerForm.email"
              [attr.aria-invalid]="registerForm.email().touched() && registerForm.email().invalid()"
              aria-describedby="register-email-error"
              class="w-full rounded-xl bg-surface-container-low py-3 pr-4 pl-11 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
            />
          </div>
          <app-field-error [field]="registerForm.email" id="register-email-error" />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-1">
            <label for="register-password" class="text-label-md text-on-surface-variant"
              >Mật khẩu</label
            >
            <div class="relative">
              <span
                class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg! leading-none! text-outline"
                aria-hidden="true"
                >lock</span
              >
              <input
                id="register-password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                [formField]="registerForm.password"
                [attr.aria-invalid]="
                  registerForm.password().touched() && registerForm.password().invalid()
                "
                aria-describedby="register-password-hint register-password-error"
                class="w-full rounded-xl bg-surface-container-low py-3 pr-4 pl-11 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
              />
            </div>
            <app-field-error [field]="registerForm.password" id="register-password-error" />
          </div>

          <div class="space-y-1">
            <label for="register-confirm" class="text-label-md text-on-surface-variant"
              >Xác nhận mật khẩu</label
            >
            <div class="relative">
              <span
                class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg! leading-none! text-outline"
                aria-hidden="true"
                >lock_reset</span
              >
              <input
                id="register-confirm"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                [formField]="registerForm.confirmPassword"
                [attr.aria-invalid]="
                  registerForm.confirmPassword().touched() &&
                  registerForm.confirmPassword().invalid()
                "
                aria-describedby="register-confirm-error"
                class="w-full rounded-xl bg-surface-container-low py-3 pr-4 pl-11 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
              />
            </div>
            <app-field-error [field]="registerForm.confirmPassword" id="register-confirm-error" />
          </div>
        </div>

        <p id="register-password-hint" class="text-body-sm text-outline">
          Mật khẩu ít nhất 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
        </p>

        <app-form-alert [messages]="serverErrors()" />

        <button
          type="submit"
          [disabled]="registerForm().submitting()"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-headline-sm text-on-primary shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-60"
        >
          <span>Đăng ký tài khoản</span>
          <span class="material-symbols-outlined text-lg!" aria-hidden="true">arrow_forward</span>
        </button>
      </form>
    </app-auth-card>
  `,
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly model = signal({ fullName: '', email: '', password: '', confirmPassword: '' });
  protected readonly serverErrors = signal<string[]>([]);

  // Quy tắc giống backend (RegisterRequest + cấu hình Identity trong Program.cs) để báo lỗi ngay, đỡ gọi API thừa.
  protected readonly registerForm = form(
    this.model,
    (path) => {
      required(path.fullName, { message: 'Vui lòng nhập họ và tên.' });
      maxLength(path.fullName, 100, { message: 'Họ và tên tối đa 100 ký tự.' });

      required(path.email, { message: 'Vui lòng nhập email.' });
      email(path.email, { message: 'Email không hợp lệ.' });
      maxLength(path.email, 256, { message: 'Email tối đa 256 ký tự.' });

      required(path.password, { message: 'Vui lòng nhập mật khẩu.' });
      minLength(path.password, 8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
      pattern(path.password, /[A-Z]/, { message: 'Mật khẩu phải có ít nhất một chữ hoa (A-Z).' });
      pattern(path.password, /[a-z]/, {
        message: 'Mật khẩu phải có ít nhất một chữ thường (a-z).',
      });
      pattern(path.password, /[0-9]/, { message: 'Mật khẩu phải có ít nhất một chữ số (0-9).' });
      pattern(path.password, /[^a-zA-Z0-9]/, {
        message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (ví dụ @, #, $).',
      });

      required(path.confirmPassword, { message: 'Vui lòng xác nhận mật khẩu.' });
      validate(path.confirmPassword, ({ value, valueOf }) =>
        value() && value() !== valueOf(path.password)
          ? { kind: 'passwordMismatch', message: 'Mật khẩu xác nhận không khớp.' }
          : undefined,
      );
    },
    {
      submission: {
        // Chỉ chạy khi form hợp lệ. API đăng ký không trả token nên đăng nhập luôn bằng thông tin vừa nhập.
        action: async () => {
          this.serverErrors.set([]);
          const request = this.model();
          try {
            await firstValueFrom(this.auth.register(request));
            await firstValueFrom(
              this.auth.login({ email: request.email, password: request.password }),
            );
            await this.router.navigateByUrl('/');
          } catch (error) {
            this.serverErrors.set(getApiErrors(error));
          }
          return undefined;
        },
      },
    },
  );
}
