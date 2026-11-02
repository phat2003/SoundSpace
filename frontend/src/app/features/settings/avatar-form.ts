import { Component, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { getApiErrors } from '../../core/http/api-error';
import { Profile } from '../../core/models/profile';
import { ProfileService } from '../../core/profile/profile.service';
import { FormAlert } from '../auth/form-alert';

// Giống MediaSettings của backend (AllowImageFileTypes, MaxImageSizeInMB) để báo lỗi ngay, đỡ upload thừa.
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_SIZE_MB = 5;

const validateImage = (file: File): string | null => {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Ảnh tối đa ${MAX_SIZE_MB} MB.`;
  }
  return null;
};

/** Khối "Ảnh đại diện": chọn ảnh là upload luôn (PUT /api/profile/avatar), ảnh cũ do API tự xoá. */
@Component({
  selector: 'app-avatar-form',
  imports: [FormAlert],
  template: `
    <section
      aria-labelledby="settings-avatar-heading"
      class="flex flex-col gap-6 rounded-2xl bg-surface-container-low/50 p-6 backdrop-blur-xl sm:p-8"
    >
      <h2 id="settings-avatar-heading" class="font-headline-md text-on-surface">Ảnh đại diện</h2>

      <div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div class="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container-high">
          @if (profile().avatarUrl; as avatarUrl) {
            <img [src]="avatarUrl" alt="Ảnh đại diện hiện tại" class="h-full w-full object-cover" />
          } @else {
            <span
              class="flex h-full w-full items-center justify-center bg-primary-container font-headline-lg text-on-primary-container"
              aria-hidden="true"
              >{{ profile().fullName.charAt(0).toUpperCase() }}</span
            >
          }
        </div>

        <div class="flex flex-col gap-2">
          <input
            #fileInput
            type="file"
            class="hidden"
            [accept]="accept"
            (change)="upload(fileInput)"
          />
          <button
            type="button"
            [disabled]="uploading()"
            aria-describedby="settings-avatar-hint"
            class="flex w-fit items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 font-label-md text-on-surface transition-colors hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50"
            (click)="fileInput.click()"
          >
            <span class="material-symbols-outlined text-lg!" aria-hidden="true">photo_camera</span>
            {{ uploading() ? 'Đang tải ảnh lên...' : 'Đổi ảnh' }}
          </button>
          <p id="settings-avatar-hint" class="text-body-sm text-outline">
            JPG, PNG hoặc WEBP, tối đa {{ maxSizeMb }} MB.
          </p>
        </div>
      </div>

      <app-form-alert [messages]="errors()" />
      @if (saved()) {
        <p role="status" class="flex items-center gap-2 text-body-md text-secondary">
          <span class="material-symbols-outlined text-lg!" aria-hidden="true">check_circle</span>
          Đã đổi ảnh đại diện.
        </p>
      }
    </section>
  `,
})
export class AvatarForm {
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);

  readonly profile = input.required<Profile>();
  /** Báo cho trang cha hồ sơ mới sau khi đổi ảnh thành công. */
  readonly profileChange = output<Profile>();

  protected readonly accept = ALLOWED_EXTENSIONS.join(',');
  protected readonly maxSizeMb = MAX_SIZE_MB;
  protected readonly uploading = signal(false);
  protected readonly errors = signal<string[]>([]);
  protected readonly saved = signal(false);

  protected readonly upload = async (fileInput: HTMLInputElement) => {
    const file = fileInput.files?.[0];
    // Xoá lựa chọn để lần sau chọn lại đúng ảnh đó vẫn kích hoạt sự kiện change.
    fileInput.value = '';
    if (!file) {
      return;
    }

    this.saved.set(false);
    const error = validateImage(file);
    this.errors.set(error ? [error] : []);
    if (error) {
      return;
    }

    this.uploading.set(true);
    try {
      const updated = await firstValueFrom(this.profileService.uploadAvatar(file));
      this.profileChange.emit(updated);
      this.saved.set(true);
      // Ảnh trên header đọc từ JWT: làm mới token để lấy ảnh mới (lỗi thì bỏ qua, lần sau sẽ cập nhật).
      await firstValueFrom(this.auth.refresh()).catch(() => undefined);
    } catch (error) {
      this.errors.set(getApiErrors(error));
    } finally {
      this.uploading.set(false);
    }
  };
}
