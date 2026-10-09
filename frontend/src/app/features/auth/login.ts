import { Component, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { AuthCard } from './auth-card';
import { FieldError } from './field-error';

@Component({
  selector: 'app-login',
  imports: [AuthCard, FieldError, FormField, FormRoot],
  template: `
    <app-auth-card>
      <div>
        <h1 class="mb-2 font-headline-lg text-on-surface">Chào mừng trở lại</h1>
        <p class="text-body-md text-on-surface-variant">
          Nhập thông tin tài khoản của bạn để tiếp tục.
        </p>
      </div>

      <form [formRoot]="loginForm" class="space-y-4">
        <div class="space-y-1">
          <label for="login-email" class="text-label-md text-on-surface-variant">Email</label>
          <div class="relative">
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg! leading-none! text-outline"
              aria-hidden="true"
              >mail</span
            >
            <input
              id="login-email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              [formField]="loginForm.email"
              [attr.aria-invalid]="loginForm.email().touched() && loginForm.email().invalid()"
              aria-describedby="login-email-error"
              class="w-full rounded-xl bg-surface-container-low py-3 pr-4 pl-11 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
            />
          </div>
          <app-field-error [field]="loginForm.email" id="login-email-error" />
        </div>

        <div class="space-y-1">
          <label for="login-password" class="text-label-md text-on-surface-variant">Mật khẩu</label>
          <div class="relative">
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg! leading-none! text-outline"
              aria-hidden="true"
              >lock</span
            >
            <input
              id="login-password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              [formField]="loginForm.password"
              [attr.aria-invalid]="loginForm.password().touched() && loginForm.password().invalid()"
              aria-describedby="login-password-error"
              class="w-full rounded-xl bg-surface-container-low py-3 pr-4 pl-11 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
            />
          </div>
          <app-field-error [field]="loginForm.password" id="login-password-error" />
        </div>

        <button
          type="submit"
          [disabled]="loginForm().submitting()"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-headline-sm text-on-primary shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-60"
        >
          <span>Đăng nhập</span>
          <span class="material-symbols-outlined text-lg!" aria-hidden="true">arrow_forward</span>
        </button>
      </form>
    </app-auth-card>
  `,
})
export class Login {
  private readonly model = signal({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Vui lòng nhập email.' });
      email(path.email, { message: 'Email không hợp lệ.' });
      required(path.password, { message: 'Vui lòng nhập mật khẩu.' });
    },
    {
      submission: {
        // Chỉ chạy khi form hợp lệ. Gọi API POST /api/auth/login sẽ làm ở task SS-57 (nối FE với API).
        action: async () => undefined,
      },
    },
  );
}
