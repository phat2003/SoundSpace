import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { getApiErrors } from '../../core/http/api-error';
import { ProfileService } from '../../core/profile/profile.service';
import { AccountInfoForm } from './account-info-form';
import { ChangePasswordForm } from './change-password-form';

/**
 * Trang Cài đặt theo mẫu Stitch "Cài đặt". MVP chỉ có mục Tài khoản (sửa tên, đổi mật khẩu, đăng xuất);
 * các mục Âm thanh, Giao diện, Thông báo, Quyền riêng tư, Bộ nhớ và thẻ Premium nằm ngoài MVP nên không hiện.
 */
@Component({
  selector: 'app-settings',
  imports: [AccountInfoForm, ChangePasswordForm],
  host: {
    class: 'flex flex-col gap-8 px-space-md py-space-xl sm:px-space-lg lg:flex-row',
  },
  template: `
    <!-- Menu con của Cài đặt -->
    <nav aria-label="Mục cài đặt" class="w-full shrink-0 lg:w-72">
      <div
        class="flex flex-col gap-2 rounded-2xl bg-surface-container-low/60 p-4 backdrop-blur-xl lg:sticky lg:top-24"
      >
        <p class="px-4 py-2 font-label-sm tracking-wider text-outline uppercase">
          Cài đặt hệ thống
        </p>
        <span
          aria-current="page"
          class="flex items-center gap-3 rounded-xl bg-primary-container px-4 py-3 font-label-md text-on-primary-container"
        >
          <span class="material-symbols-outlined icon-filled" aria-hidden="true"
            >account_circle</span
          >
          Tài khoản
        </span>
        <div class="my-2 h-px bg-outline-variant/20"></div>
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl px-4 py-3 font-label-md text-error transition-all hover:bg-error-container/20 focus-visible:outline-2 focus-visible:outline-secondary"
          (click)="auth.logout()"
        >
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          Đăng xuất
        </button>
      </div>
    </nav>

    <div class="flex min-w-0 flex-1 flex-col gap-8">
      <div>
        <h1 class="font-headline-lg text-on-surface">Tài khoản</h1>
        <p class="mt-1 text-body-md text-outline">Quản lý thông tin cá nhân và mật khẩu của bạn.</p>
      </div>

      @if (profile.error()) {
        <div
          role="alert"
          class="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-low px-6 py-12 text-center"
        >
          <span class="material-symbols-outlined text-5xl! text-error" aria-hidden="true"
            >error</span
          >
          <p class="text-body-lg text-on-surface-variant">{{ errorMessage() }}</p>
          <button
            type="button"
            class="rounded-xl bg-surface-container-high px-4 py-2 font-label-md text-on-surface hover:bg-surface-bright"
            (click)="profile.reload()"
          >
            Thử lại
          </button>
        </div>
      } @else if (profile.hasValue()) {
        <app-account-info-form [profile]="profile.value()" (profileChange)="profile.set($event)" />
        <app-change-password-form />
      } @else {
        <div class="h-64 animate-pulse rounded-2xl bg-surface-container-low" aria-busy="true">
          <span class="sr-only">Đang tải thông tin tài khoản...</span>
        </div>
      }
    </div>
  `,
})
export class Settings {
  private readonly profileService = inject(ProfileService);
  protected readonly auth = inject(AuthService);

  protected readonly profile = rxResource({ stream: () => this.profileService.getProfile() });

  protected readonly errorMessage = () => getApiErrors(this.profile.error())[0];
}
