import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { getApiErrors } from '../../core/http/api-error';
import { FieldError } from '../auth/field-error';
import { FormAlert } from '../auth/form-alert';
import { passwordRules } from '../auth/password-rules';

const EMPTY_MODEL = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** Khối "Đổi mật khẩu" (PUT /api/profile/change-password). Không có trong mẫu Stitch nhưng thuộc MVP. */
@Component({
  selector: 'app-change-password-form',
  imports: [FieldError, FormAlert, FormField, FormRoot],
  template: `
    <form
      [formRoot]="passwordForm"
      class="flex flex-col gap-6 rounded-2xl bg-surface-container-low/50 p-6 backdrop-blur-xl sm:p-8"
    >
      <h2 class="font-headline-md text-on-surface">Đổi mật khẩu</h2>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="flex flex-col gap-2 md:col-span-2 md:max-w-[calc(50%-0.75rem)]">
          <label for="settings-current-password" class="text-label-md text-on-surface-variant"
            >Mật khẩu hiện tại</label
          >
          <input
            id="settings-current-password"
            type="password"
            autocomplete="current-password"
            [formField]="passwordForm.currentPassword"
            [attr.aria-invalid]="
              passwordForm.currentPassword().touched() && passwordForm.currentPassword().invalid()
            "
            aria-describedby="settings-current-password-error"
            class="rounded-xl bg-surface-container px-4 py-3 text-on-surface transition-all focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
          />
          <app-field-error
            [field]="passwordForm.currentPassword"
            id="settings-current-password-error"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="settings-new-password" class="text-label-md text-on-surface-variant"
            >Mật khẩu mới</label
          >
          <input
            id="settings-new-password"
            type="password"
            autocomplete="new-password"
            [formField]="passwordForm.newPassword"
            [attr.aria-invalid]="
              passwordForm.newPassword().touched() && passwordForm.newPassword().invalid()
            "
            aria-describedby="settings-password-hint settings-new-password-error"
            class="rounded-xl bg-surface-container px-4 py-3 text-on-surface transition-all focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
          />
          <app-field-error [field]="passwordForm.newPassword" id="settings-new-password-error" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="settings-confirm-password" class="text-label-md text-on-surface-variant"
            >Xác nhận mật khẩu mới</label
          >
          <input
            id="settings-confirm-password"
            type="password"
            autocomplete="new-password"
            [formField]="passwordForm.confirmPassword"
            [attr.aria-invalid]="
              passwordForm.confirmPassword().touched() && passwordForm.confirmPassword().invalid()
            "
            aria-describedby="settings-confirm-password-error"
            class="rounded-xl bg-surface-container px-4 py-3 text-on-surface transition-all focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
          />
          <app-field-error
            [field]="passwordForm.confirmPassword"
            id="settings-confirm-password-error"
          />
        </div>
      </div>

      <p id="settings-password-hint" class="text-body-sm text-outline">
        Mật khẩu ít nhất 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
      </p>

      <app-form-alert [messages]="serverErrors()" />
      @if (changed()) {
        <p role="status" class="flex items-center gap-2 text-body-md text-secondary">
          <span class="material-symbols-outlined text-lg!" aria-hidden="true">check_circle</span>
          Đã đổi mật khẩu.
        </p>
      }

      <div class="flex justify-end">
        <button
          type="submit"
          [disabled]="passwordForm().submitting()"
          class="rounded-xl bg-primary px-6 py-3 font-label-md text-on-primary shadow-[0_0_20px_rgba(208,188,255,0.3)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Đổi mật khẩu
        </button>
      </div>
    </form>
  `,
})
export class ChangePasswordForm {
  private readonly auth = inject(AuthService);

  private readonly model = signal(EMPTY_MODEL);
  protected readonly serverErrors = signal<string[]>([]);
  protected readonly changed = signal(false);

  // Quy tắc giống backend (ChangePasswordRequest + cấu hình Identity) để báo lỗi ngay.
  protected readonly passwordForm = form(
    this.model,
    (path) => {
      required(path.currentPassword, { message: 'Vui lòng nhập mật khẩu hiện tại.' });

      passwordRules(path.newPassword);
      validate(path.newPassword, ({ value, valueOf }) =>
        value() && value() === valueOf(path.currentPassword)
          ? { kind: 'samePassword', message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' }
          : undefined,
      );

      required(path.confirmPassword, { message: 'Vui lòng xác nhận mật khẩu mới.' });
      validate(path.confirmPassword, ({ value, valueOf }) =>
        value() && value() !== valueOf(path.newPassword)
          ? { kind: 'passwordMismatch', message: 'Mật khẩu xác nhận không khớp.' }
          : undefined,
      );
    },
    {
      submission: {
        action: async () => {
          this.serverErrors.set([]);
          this.changed.set(false);
          try {
            // AuthService tự lưu cặp token mới mà API trả về.
            await firstValueFrom(this.auth.changePassword(this.model()));
            this.passwordForm().reset(EMPTY_MODEL);
            this.changed.set(true);
          } catch (error) {
            this.serverErrors.set(getApiErrors(error));
          }
          return undefined;
        },
      },
    },
  );
}
