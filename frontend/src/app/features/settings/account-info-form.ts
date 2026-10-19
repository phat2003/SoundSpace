import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { getApiErrors } from '../../core/http/api-error';
import { Profile } from '../../core/models/profile';
import { ProfileService } from '../../core/profile/profile.service';
import { FieldError } from '../auth/field-error';
import { FormAlert } from '../auth/form-alert';

/** Khối "Thông tin cá nhân": sửa tên hiển thị (PUT /api/profile). Email chỉ hiển thị vì là tên đăng nhập. */
@Component({
  selector: 'app-account-info-form',
  imports: [FieldError, FormAlert, FormField, FormRoot],
  template: `
    <form
      [formRoot]="infoForm"
      class="flex flex-col gap-6 rounded-2xl bg-surface-container-low/50 p-6 backdrop-blur-xl sm:p-8"
    >
      <h2 class="font-headline-md text-on-surface">Thông tin cá nhân</h2>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <label for="settings-name" class="text-label-md text-on-surface-variant"
            >Tên hiển thị</label
          >
          <input
            id="settings-name"
            type="text"
            autocomplete="name"
            [formField]="infoForm.fullName"
            [attr.aria-invalid]="infoForm.fullName().touched() && infoForm.fullName().invalid()"
            aria-describedby="settings-name-error"
            class="rounded-xl bg-surface-container px-4 py-3 text-on-surface transition-all focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error"
          />
          <app-field-error [field]="infoForm.fullName" id="settings-name-error" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="settings-email" class="text-label-md text-on-surface-variant">Email</label>
          <input
            id="settings-email"
            type="email"
            readonly
            [value]="profile().email"
            aria-describedby="settings-email-hint"
            class="cursor-not-allowed rounded-xl bg-surface-container/60 px-4 py-3 text-on-surface-variant focus:ring-2 focus:ring-secondary focus:outline-none"
          />
          <p id="settings-email-hint" class="text-body-sm text-outline">
            Email dùng để đăng nhập nên không đổi được.
          </p>
        </div>
      </div>

      <app-form-alert [messages]="serverErrors()" />
      @if (saved()) {
        <p role="status" class="flex items-center gap-2 text-body-md text-secondary">
          <span class="material-symbols-outlined text-lg!" aria-hidden="true">check_circle</span>
          Đã lưu thay đổi.
        </p>
      }

      <div class="flex justify-end">
        <button
          type="submit"
          [disabled]="unchanged() || infoForm().submitting()"
          class="rounded-xl bg-primary px-6 py-3 font-label-md text-on-primary shadow-[0_0_20px_rgba(208,188,255,0.3)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lưu thay đổi
        </button>
      </div>
    </form>
  `,
})
export class AccountInfoForm {
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);

  readonly profile = input.required<Profile>();
  /** Báo cho trang cha hồ sơ mới sau khi lưu thành công. */
  readonly profileChange = output<Profile>();

  // Mỗi khi hồ sơ (input) đổi thì form lấy lại tên từ hồ sơ.
  private readonly model = linkedSignal(() => ({ fullName: this.profile().fullName }));
  protected readonly serverErrors = signal<string[]>([]);
  protected readonly saved = signal(false);
  protected readonly unchanged = computed(
    () => this.model().fullName.trim() === this.profile().fullName,
  );

  protected readonly infoForm = form(
    this.model,
    (path) => {
      required(path.fullName, { message: 'Vui lòng nhập họ và tên.' });
      maxLength(path.fullName, 100, { message: 'Họ và tên tối đa 100 ký tự.' });
    },
    {
      submission: {
        action: async () => {
          this.serverErrors.set([]);
          this.saved.set(false);
          try {
            const updated = await firstValueFrom(
              this.profileService.updateProfile({ fullName: this.model().fullName.trim() }),
            );
            this.profileChange.emit(updated);
            this.saved.set(true);
            // Tên trên header đọc từ JWT: làm mới token để lấy tên mới (lỗi thì bỏ qua, lần sau sẽ cập nhật).
            await firstValueFrom(this.auth.refresh()).catch(() => undefined);
          } catch (error) {
            this.serverErrors.set(getApiErrors(error));
          }
          return undefined;
        },
      },
    },
  );
}
