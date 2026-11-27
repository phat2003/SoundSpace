import { Component, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ImageFolder, MediaAdminService } from '../../core/admin/media-admin.service';
import { getApiErrors } from '../../core/http/api-error';
import {
  IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE_MB,
  validateImage,
} from '../../shared/utils/validate-image';

/**
 * Ô upload ảnh cho form quản trị, theo khung nét đứt "Ảnh đại diện" / "Ảnh bìa" của mẫu Stitch "Thêm / Sửa nghệ sĩ".
 * Bấm vào khung để chọn ảnh → upload lên R2 ngay (POST api/admin/media/image) → phát urlChange với URL mới;
 * "Bỏ ảnh" phát urlChange(''). Việc xoá ảnh đã upload mà không dùng nữa do form cha quyết định.
 */
@Component({
  selector: 'app-image-upload-field',
  template: `
    <div class="flex flex-col gap-2">
      <span class="font-label-md text-on-surface-variant">{{ label() }}</span>
      <input #fileInput type="file" class="hidden" [accept]="accept" (change)="upload(fileInput)" />
      <button
        type="button"
        [disabled]="uploading() || disabled()"
        [attr.aria-label]="(url() ? 'Đổi ' : 'Chọn ') + label().toLowerCase()"
        [attr.aria-describedby]="hintId()"
        class="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-outline-variant bg-surface-container transition-all hover:border-primary focus-visible:outline-2 focus-visible:outline-secondary disabled:cursor-wait"
        [class]="heightClass()"
        (click)="fileInput.click()"
      >
        @if (url()) {
          <img
            [src]="url()"
            alt=""
            class="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
          />
        }
        <span
          class="absolute inset-0 flex flex-col items-center justify-center bg-surface/40 backdrop-blur-[2px] transition-opacity"
          [class]="
            url() && !uploading()
              ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
              : 'opacity-100'
          "
        >
          <span class="material-symbols-outlined mb-1 text-3xl! text-primary" aria-hidden="true">{{
            uploading() ? 'hourglass_top' : url() ? 'upload_file' : 'add_photo_alternate'
          }}</span>
          <span class="text-body-sm font-semibold text-on-surface">{{
            uploading() ? 'Đang tải ảnh lên...' : url() ? 'Đổi ảnh' : 'Tải ảnh lên'
          }}</span>
        </span>
      </button>
      <div class="flex items-start justify-between gap-3">
        <p [id]="hintId()" class="text-body-sm text-outline">
          JPG, PNG hoặc WEBP, tối đa {{ maxSizeMb }} MB.
        </p>
        @if (url() && !uploading()) {
          <button
            type="button"
            [disabled]="disabled()"
            class="shrink-0 rounded-lg px-2 py-1 font-label-sm text-error transition-colors hover:bg-error-container/20 focus-visible:outline-2 focus-visible:outline-secondary disabled:opacity-50"
            (click)="urlChange.emit('')"
          >
            Bỏ ảnh
          </button>
        }
      </div>
      @if (error(); as message) {
        <p role="alert" class="flex items-center gap-1 text-body-sm text-error">
          <span class="material-symbols-outlined text-[16px]!" aria-hidden="true">error</span>
          {{ message }}
        </p>
      }
    </div>
  `,
})
export class ImageUploadField {
  private readonly mediaService = inject(MediaAdminService);

  readonly label = input.required<string>();
  /** URL ảnh hiện tại ('' = chưa có ảnh). */
  readonly url = input.required<string>();
  /** Thư mục trong bucket ảnh (xem ImageFolders ở backend). */
  readonly folder = input.required<ImageFolder>();
  /** Chiều cao khung, ví dụ 'h-48'. */
  readonly heightClass = input('h-40');
  /** Id cho dòng gợi ý (aria-describedby), cần khác nhau giữa các ô trong cùng trang. */
  readonly hintId = input.required<string>();
  /** Form cha đang lưu: khoá các nút. */
  readonly disabled = input(false);
  readonly urlChange = output<string>();

  protected readonly accept = IMAGE_EXTENSIONS.join(',');
  protected readonly maxSizeMb = MAX_IMAGE_SIZE_MB;
  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly upload = async (fileInput: HTMLInputElement) => {
    const file = fileInput.files?.[0];
    // Xoá lựa chọn để lần sau chọn lại đúng ảnh đó vẫn kích hoạt sự kiện change.
    fileInput.value = '';
    if (!file) {
      return;
    }

    const invalid = validateImage(file);
    this.error.set(invalid);
    if (invalid) {
      return;
    }

    this.uploading.set(true);
    try {
      const { url } = await firstValueFrom(this.mediaService.uploadImage(file, this.folder()));
      this.urlChange.emit(url);
    } catch (uploadError) {
      this.error.set(getApiErrors(uploadError)[0]);
    } finally {
      this.uploading.set(false);
    }
  };
}
