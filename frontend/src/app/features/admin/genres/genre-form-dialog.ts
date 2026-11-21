import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  pattern,
  required,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { GenreAdminService } from '../../../core/admin/genre-admin.service';
import { MediaAdminService } from '../../../core/admin/media-admin.service';
import { getApiErrors } from '../../../core/http/api-error';
import { CreateUpdateGenreRequest, Genre } from '../../../core/models/genre';
import { slugify } from '../../../shared/utils/slugify';
import { IMAGE_EXTENSIONS, validateImage } from '../../../shared/utils/validate-image';
import { FieldError } from '../../auth/field-error';
import { FormAlert } from '../../auth/form-alert';

// Model của form: icon / ảnh dùng chuỗi rỗng thay cho null để gắn vào ô nhập, đổi lại null khi gửi API.
const toFormModel = (genre: Genre | null) => ({
  name: genre?.name ?? '',
  slug: genre?.slug ?? '',
  icon: genre?.icon ?? '',
  coverImageUrl: genre?.coverImageUrl ?? '',
  sortOrder: genre?.sortOrder ?? 0,
  isActive: genre?.isActive ?? true,
});

const INPUT_CLASS =
  'w-full rounded-xl bg-surface px-4 py-3 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error';

/**
 * Hộp thoại thêm / sửa thể loại (genre = null là thêm mới). Slug tự sinh theo tên cho tới khi admin tự sửa slug.
 * Ảnh bìa được upload lên R2 ngay khi chọn; huỷ form thì ảnh vừa upload (chưa lưu) được xoá để không thành file rác.
 */
@Component({
  selector: 'app-genre-form-dialog',
  imports: [FieldError, FormAlert, FormField, FormRoot],
  template: `
    <dialog
      #dialog
      aria-labelledby="genre-dialog-title"
      class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-surface-container text-on-surface shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      (cancel)="onEscape($event)"
    >
      <form [formRoot]="genreForm" class="flex flex-col gap-6 p-6 sm:p-8">
        <div class="flex items-center justify-between gap-4">
          <h2 id="genre-dialog-title" class="font-headline-md">
            {{ genre() ? 'Sửa thể loại' : 'Thêm thể loại' }}
          </h2>
          <button
            type="button"
            aria-label="Đóng"
            [disabled]="busy()"
            class="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-secondary disabled:opacity-50"
            (click)="cancel()"
          >
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <!-- Ảnh bìa -->
        <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-container-high"
          >
            @if (model().coverImageUrl) {
              <img
                [src]="model().coverImageUrl"
                alt="Ảnh bìa thể loại"
                class="h-full w-full object-cover"
              />
            } @else {
              <span class="material-symbols-outlined text-4xl! text-outline" aria-hidden="true">{{
                model().icon || 'image'
              }}</span>
            }
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-label-md text-on-surface-variant">Ảnh bìa (không bắt buộc)</span>
            <input
              #fileInput
              type="file"
              class="hidden"
              [accept]="imageAccept"
              (change)="uploadCover(fileInput)"
            />
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                [disabled]="busy()"
                aria-describedby="genre-cover-hint"
                class="flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2 font-label-md text-on-surface transition-colors hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50"
                (click)="fileInput.click()"
              >
                <span class="material-symbols-outlined text-lg!" aria-hidden="true">upload</span>
                {{
                  uploading()
                    ? 'Đang tải ảnh lên...'
                    : model().coverImageUrl
                      ? 'Đổi ảnh'
                      : 'Chọn ảnh'
                }}
              </button>
              @if (model().coverImageUrl) {
                <button
                  type="button"
                  [disabled]="busy()"
                  class="rounded-xl px-4 py-2 font-label-md text-error transition-colors hover:bg-error-container/20 focus-visible:outline-2 focus-visible:outline-secondary disabled:opacity-50"
                  (click)="removeCover()"
                >
                  Bỏ ảnh
                </button>
              }
            </div>
            <p id="genre-cover-hint" class="text-body-sm text-outline">
              JPG, PNG hoặc WEBP, tối đa 5 MB. Không có ảnh thì hiện icon.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label for="genre-name" class="text-label-md text-on-surface-variant"
              >Tên thể loại</label
            >
            <input
              id="genre-name"
              type="text"
              placeholder="Ví dụ: Nhạc trẻ"
              [formField]="genreForm.name"
              [attr.aria-invalid]="genreForm.name().touched() && genreForm.name().invalid()"
              aria-describedby="genre-name-error"
              [class]="inputClass"
              (input)="onNameInput($any($event.target).value)"
            />
            <app-field-error [field]="genreForm.name" id="genre-name-error" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="genre-slug" class="text-label-md text-on-surface-variant">Slug</label>
            <input
              id="genre-slug"
              type="text"
              placeholder="nhac-tre"
              [formField]="genreForm.slug"
              [attr.aria-invalid]="genreForm.slug().touched() && genreForm.slug().invalid()"
              aria-describedby="genre-slug-hint genre-slug-error"
              [class]="inputClass"
              (input)="onSlugInput($any($event.target).value)"
            />
            <p id="genre-slug-hint" class="text-body-sm text-outline">
              Dùng trên đường dẫn, tự tạo theo tên. Chỉ chữ thường không dấu, số và "-".
            </p>
            <app-field-error [field]="genreForm.slug" id="genre-slug-error" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="genre-icon" class="text-label-md text-on-surface-variant"
              >Icon (không bắt buộc)</label
            >
            <div class="relative">
              <span
                class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-primary"
                aria-hidden="true"
                >{{ model().icon || 'category' }}</span
              >
              <input
                id="genre-icon"
                type="text"
                placeholder="headphones"
                [formField]="genreForm.icon"
                [attr.aria-invalid]="genreForm.icon().touched() && genreForm.icon().invalid()"
                aria-describedby="genre-icon-hint genre-icon-error"
                [class]="inputClass + ' pl-12'"
              />
            </div>
            <p id="genre-icon-hint" class="text-body-sm text-outline">
              Tên icon trong
              <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noopener"
                class="text-secondary hover:underline"
                >Material Symbols</a
              >, ví dụ headphones, piano, mic.
            </p>
            <app-field-error [field]="genreForm.icon" id="genre-icon-error" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="genre-sort-order" class="text-label-md text-on-surface-variant"
              >Thứ tự hiển thị</label
            >
            <input
              id="genre-sort-order"
              type="number"
              [formField]="genreForm.sortOrder"
              [attr.aria-invalid]="!!sortOrderError()"
              aria-describedby="genre-sort-order-hint genre-sort-order-error"
              [class]="inputClass"
            />
            <p id="genre-sort-order-hint" class="text-body-sm text-outline">
              Số nhỏ hiện trước (0 – 9999).
            </p>
            @if (sortOrderError(); as message) {
              <p
                id="genre-sort-order-error"
                role="alert"
                class="flex items-center gap-1 text-body-sm text-error"
              >
                <span class="material-symbols-outlined text-[16px]!" aria-hidden="true">error</span>
                {{ message }}
              </p>
            }
          </div>
        </div>

        <label class="flex w-fit cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            [formField]="genreForm.isActive"
            class="h-5 w-5 accent-primary focus-visible:outline-2 focus-visible:outline-secondary"
          />
          <span class="text-body-md text-on-surface">Hiển thị cho người nghe</span>
        </label>

        <app-form-alert [messages]="serverErrors()" />

        <div class="flex justify-end gap-3">
          <button
            type="button"
            [disabled]="busy()"
            class="rounded-xl bg-surface-container-high px-5 py-3 font-label-md text-on-surface transition-colors hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-secondary disabled:opacity-50"
            (click)="cancel()"
          >
            Huỷ
          </button>
          <button
            type="submit"
            [disabled]="busy()"
            class="rounded-xl bg-primary px-6 py-3 font-label-md text-on-primary shadow-[0_0_20px_rgba(208,188,255,0.3)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{
              genreForm().submitting() ? 'Đang lưu...' : genre() ? 'Lưu thay đổi' : 'Thêm thể loại'
            }}
          </button>
        </div>
      </form>
    </dialog>
  `,
})
export class GenreFormDialog {
  private readonly genreService = inject(GenreAdminService);
  private readonly mediaService = inject(MediaAdminService);

  /** null = thêm mới. */
  readonly genre = input<Genre | null>(null);
  /** Lưu thành công, trả về thể loại từ API. */
  readonly saved = output<Genre>();
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly inputClass = INPUT_CLASS;
  protected readonly imageAccept = IMAGE_EXTENSIONS.join(',');
  protected readonly model = linkedSignal(() => toFormModel(this.genre()));
  protected readonly serverErrors = signal<string[]>([]);
  protected readonly uploading = signal(false);
  // Đang sửa thì giữ nguyên slug cũ; thêm mới thì slug chạy theo tên cho tới khi admin tự gõ slug.
  private readonly slugEdited = linkedSignal(() => this.genre() !== null);
  // Ảnh đã upload trong lần mở form này nhưng chưa lưu vào thể loại.
  private pendingUploadUrl: string | null = null;

  // Quy tắc giống CreateUpdateGenreRequest ở backend.
  protected readonly genreForm = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Vui lòng nhập tên thể loại.' });
      maxLength(path.name, 100, { message: 'Tên thể loại tối đa 100 ký tự.' });

      required(path.slug, { message: 'Vui lòng nhập slug.' });
      maxLength(path.slug, 100, { message: 'Slug tối đa 100 ký tự.' });
      pattern(path.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message: 'Slug chỉ gồm chữ thường không dấu, số và dấu "-" (ví dụ: nhac-tre).',
      });

      maxLength(path.icon, 50, { message: 'Tên icon tối đa 50 ký tự.' });
      pattern(path.icon, /^[a-z0-9_]*$/, {
        message: 'Tên icon chỉ gồm chữ thường, số và dấu "_" (ví dụ: music_note).',
      });

      min(path.sortOrder, 0, { message: 'Thứ tự hiển thị từ 0 đến 9999.' });
      max(path.sortOrder, 9999, { message: 'Thứ tự hiển thị từ 0 đến 9999.' });
    },
    {
      submission: {
        action: async () => {
          this.serverErrors.set([]);
          const value = this.model();
          const request: CreateUpdateGenreRequest = {
            name: value.name.trim(),
            slug: value.slug,
            icon: value.icon.trim() || null,
            coverImageUrl: value.coverImageUrl || null,
            sortOrder: value.sortOrder,
            isActive: value.isActive,
          };
          const current = this.genre();
          try {
            const result = await firstValueFrom(
              current
                ? this.genreService.updateGenre(current.id, request)
                : this.genreService.createGenre(request),
            );
            // Ảnh mới đã thuộc về thể loại; ảnh cũ (nếu đổi) do API tự xoá.
            this.pendingUploadUrl = null;
            this.saved.emit(result);
          } catch (error) {
            this.serverErrors.set(getApiErrors(error));
          }
          return undefined;
        },
      },
    },
  );

  protected readonly busy = computed(() => this.uploading() || this.genreForm().submitting());

  protected readonly sortOrderError = computed(() => {
    const state = this.genreForm.sortOrder();
    return state.touched() ? state.errors()[0]?.message : undefined;
  });

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected readonly onNameInput = (name: string) => {
    if (!this.slugEdited()) {
      this.genreForm.slug().value.set(slugify(name));
    }
  };

  // Xoá trắng slug thì quay lại chế độ tự sinh theo tên.
  protected readonly onSlugInput = (slug: string) => this.slugEdited.set(slug.trim() !== '');

  protected readonly uploadCover = async (fileInput: HTMLInputElement) => {
    const file = fileInput.files?.[0];
    // Xoá lựa chọn để lần sau chọn lại đúng ảnh đó vẫn kích hoạt sự kiện change.
    fileInput.value = '';
    if (!file) {
      return;
    }

    const error = validateImage(file);
    this.serverErrors.set(error ? [error] : []);
    if (error) {
      return;
    }

    this.uploading.set(true);
    try {
      const { url } = await firstValueFrom(this.mediaService.uploadImage(file, 'genres'));
      this.discardPendingUpload();
      this.pendingUploadUrl = url;
      this.genreForm.coverImageUrl().value.set(url);
    } catch (uploadError) {
      this.serverErrors.set(getApiErrors(uploadError));
    } finally {
      this.uploading.set(false);
    }
  };

  protected readonly removeCover = () => {
    this.discardPendingUpload();
    this.genreForm.coverImageUrl().value.set('');
  };

  protected readonly cancel = () => {
    this.discardPendingUpload();
    this.closed.emit();
  };

  protected readonly onEscape = (event: Event) => {
    event.preventDefault();
    if (!this.busy()) {
      this.cancel();
    }
  };

  // Xoá ảnh đã upload mà không dùng nữa; lỗi thì bỏ qua (chỉ còn một file thừa trên R2).
  private readonly discardPendingUpload = () => {
    if (this.pendingUploadUrl) {
      this.mediaService.deleteImage(this.pendingUploadUrl).subscribe({ error: () => undefined });
      this.pendingUploadUrl = null;
    }
  };
}
