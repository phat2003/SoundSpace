import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField, FormRoot, maxLength, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ArtistAdminService } from '../../../core/admin/artist-admin.service';
import { MediaAdminService } from '../../../core/admin/media-admin.service';
import { getApiErrors } from '../../../core/http/api-error';
import { Artist, CreateUpdateArtistRequest } from '../../../core/models/artist';
import { slugify } from '../../../shared/utils/slugify';
import { FieldError } from '../../auth/field-error';
import { FormAlert } from '../../auth/form-alert';
import { ImageUploadField } from '../image-upload-field';

const BIO_MAX_LENGTH = 2000;

// Model của form: tiểu sử / ảnh dùng chuỗi rỗng thay cho null để gắn vào ô nhập, đổi lại null khi gửi API.
const toFormModel = (artist: Artist | null) => ({
  name: artist?.name ?? '',
  slug: artist?.slug ?? '',
  bio: artist?.bio ?? '',
  avatarUrl: artist?.avatarUrl ?? '',
  coverImageUrl: artist?.coverImageUrl ?? '',
  isFeatured: artist?.isFeatured ?? false,
  isActive: artist?.isActive ?? true,
});

type ImageField = 'avatarUrl' | 'coverImageUrl';

const INPUT_CLASS =
  'w-full rounded-xl bg-surface-container px-4 py-3 text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none aria-invalid:ring-2 aria-invalid:ring-error';

/**
 * Trang Thêm / Sửa nghệ sĩ (/admin/artists/new, /admin/artists/:id/edit) theo mẫu Stitch "Thêm / Sửa nghệ sĩ".
 * Bỏ các phần chưa có trong dữ liệu / ngoài MVP của mẫu: thể loại chính, mạng xã hội, huy hiệu Verified,
 * thanh định dạng cho tiểu sử. Ảnh upload lên R2 ngay khi chọn; rời trang mà không lưu thì ảnh vừa upload bị xoá.
 */
@Component({
  selector: 'app-artist-form',
  imports: [FieldError, FormAlert, FormField, FormRoot, ImageUploadField, RouterLink],
  host: { class: 'flex w-full flex-col' },
  template: `
    <div class="mx-auto w-full max-w-7xl px-space-md pt-space-lg sm:px-space-lg">
      <nav aria-label="Đường dẫn" class="mb-2 flex items-center gap-2 text-body-sm text-outline">
        <a routerLink="/admin" class="hover:text-on-surface">Quản trị</a>
        <span class="material-symbols-outlined text-[14px]!" aria-hidden="true">chevron_right</span>
        <a routerLink="/admin/artists" class="hover:text-on-surface">Nghệ sĩ</a>
        <span class="material-symbols-outlined text-[14px]!" aria-hidden="true">chevron_right</span>
        <span class="text-primary" aria-current="page">{{ pageTitle() }}</span>
      </nav>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="font-headline-lg text-on-surface">{{ pageTitle() }}</h1>
        <a
          routerLink="/admin/artists"
          class="flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-2.5 font-label-md text-on-surface transition-all hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-secondary"
        >
          <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">arrow_back</span>
          Quay lại
        </a>
      </div>
    </div>

    @if (isEdit() && artist.error()) {
      <div
        role="alert"
        class="mx-auto mt-space-lg flex w-[calc(100%-2rem)] max-w-7xl flex-col items-center gap-3 rounded-2xl bg-surface-container-low px-6 py-12 text-center"
      >
        <span class="material-symbols-outlined text-5xl! text-error" aria-hidden="true">error</span>
        <p class="text-body-lg text-on-surface-variant">{{ loadError() }}</p>
        <button
          type="button"
          class="rounded-xl bg-surface-container-high px-4 py-2 font-label-md text-on-surface hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-secondary"
          (click)="artist.reload()"
        >
          Thử lại
        </button>
      </div>
    } @else if (isEdit() && !artist.hasValue()) {
      <div
        class="mx-auto mt-space-lg grid w-full max-w-7xl animate-pulse grid-cols-1 gap-space-lg px-space-md sm:px-space-lg lg:grid-cols-3"
        aria-busy="true"
      >
        <span class="sr-only">Đang tải thông tin nghệ sĩ...</span>
        <div class="h-96 rounded-2xl bg-surface-container-low lg:col-span-2"></div>
        <div class="h-96 rounded-2xl bg-surface-container-low"></div>
      </div>
    } @else {
      <form [formRoot]="artistForm" class="flex flex-col">
        <div
          class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-space-lg px-space-md py-space-lg sm:px-space-lg lg:grid-cols-3"
        >
          <!-- Cột trái: thông tin cơ bản -->
          <section
            aria-labelledby="artist-basic-heading"
            class="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-xl lg:col-span-2"
          >
            <div
              class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
            ></div>
            <h2
              id="artist-basic-heading"
              class="mb-space-lg flex items-center gap-2 font-headline-md text-on-surface"
            >
              <span class="material-symbols-outlined text-primary" aria-hidden="true">badge</span>
              Thông tin cơ bản
            </h2>
            <div class="relative flex flex-col gap-space-md">
              <div class="flex flex-col gap-2">
                <label for="artist-name" class="font-label-md text-on-surface-variant"
                  >Tên nghệ sĩ <span class="text-error" aria-hidden="true">*</span></label
                >
                <input
                  id="artist-name"
                  type="text"
                  placeholder="Ví dụ: Sơn Tùng M-TP"
                  [formField]="artistForm.name"
                  [attr.aria-invalid]="artistForm.name().touched() && artistForm.name().invalid()"
                  aria-describedby="artist-name-error"
                  [class]="inputClass"
                  (input)="onNameInput($any($event.target).value)"
                />
                <app-field-error [field]="artistForm.name" id="artist-name-error" />
              </div>

              <div class="flex flex-col gap-2">
                <label for="artist-slug" class="font-label-md text-on-surface-variant"
                  >Slug <span class="text-error" aria-hidden="true">*</span></label
                >
                <input
                  id="artist-slug"
                  type="text"
                  placeholder="son-tung-mtp"
                  [formField]="artistForm.slug"
                  [attr.aria-invalid]="artistForm.slug().touched() && artistForm.slug().invalid()"
                  aria-describedby="artist-slug-hint artist-slug-error"
                  [class]="inputClass"
                  (input)="onSlugInput($any($event.target).value)"
                />
                <p id="artist-slug-hint" class="text-body-sm text-outline">
                  Dùng trên đường dẫn trang nghệ sĩ, tự tạo theo tên. Chỉ chữ thường không dấu, số
                  và "-".
                </p>
                <app-field-error [field]="artistForm.slug" id="artist-slug-error" />
              </div>

              <div class="flex flex-col gap-2">
                <label for="artist-bio" class="font-label-md text-on-surface-variant"
                  >Tiểu sử / Giới thiệu</label
                >
                <textarea
                  id="artist-bio"
                  rows="6"
                  placeholder="Mô tả hành trình âm nhạc, phong cách, các ca khúc nổi bật của nghệ sĩ..."
                  [formField]="artistForm.bio"
                  [attr.aria-invalid]="artistForm.bio().touched() && artistForm.bio().invalid()"
                  aria-describedby="artist-bio-count artist-bio-error"
                  [class]="inputClass + ' resize-y'"
                ></textarea>
                <p
                  id="artist-bio-count"
                  class="text-right text-body-sm"
                  [class]="model().bio.length > bioMaxLength ? 'text-error' : 'text-outline'"
                >
                  {{ model().bio.length }}/{{ bioMaxLength }} ký tự
                </p>
                <app-field-error [field]="artistForm.bio" id="artist-bio-error" />
              </div>
            </div>
          </section>

          <!-- Cột phải: hình ảnh + cài đặt -->
          <div class="flex flex-col gap-space-lg">
            <section
              aria-labelledby="artist-images-heading"
              class="flex flex-col gap-space-lg rounded-2xl bg-surface-container-low p-space-lg shadow-xl"
            >
              <h2
                id="artist-images-heading"
                class="flex items-center gap-2 font-headline-md text-on-surface"
              >
                <span class="material-symbols-outlined text-primary" aria-hidden="true">image</span>
                Hình ảnh nghệ sĩ
              </h2>
              <app-image-upload-field
                label="Ảnh đại diện"
                folder="artists"
                heightClass="h-48"
                hintId="artist-avatar-hint"
                [url]="model().avatarUrl"
                [disabled]="artistForm().submitting()"
                (urlChange)="onImageChange('avatarUrl', $event)"
              />
              <app-image-upload-field
                label="Ảnh bìa"
                folder="artists"
                heightClass="h-32"
                hintId="artist-cover-hint"
                [url]="model().coverImageUrl"
                [disabled]="artistForm().submitting()"
                (urlChange)="onImageChange('coverImageUrl', $event)"
              />
            </section>

            <section
              aria-labelledby="artist-settings-heading"
              class="flex flex-col gap-space-md rounded-2xl bg-surface-container-low p-space-lg shadow-xl"
            >
              <h2
                id="artist-settings-heading"
                class="mb-2 flex items-center gap-2 font-headline-md text-on-surface"
              >
                <span class="material-symbols-outlined text-secondary" aria-hidden="true"
                  >tune</span
                >
                Cài đặt
              </h2>
              <label
                class="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-surface-container p-3"
              >
                <span>
                  <span class="block font-label-md text-on-surface"
                    >Nổi bật trên trang Khám phá</span
                  >
                  <span class="block text-body-sm text-outline"
                    >Hiện trong mục "Nghệ sĩ nổi bật"</span
                  >
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  class="peer sr-only"
                  [formField]="artistForm.isFeatured"
                />
                <span
                  class="relative h-6 w-11 shrink-0 rounded-full bg-surface-container-high transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
                  aria-hidden="true"
                ></span>
              </label>
              <label
                class="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-surface-container p-3"
              >
                <span>
                  <span class="block font-label-md text-on-surface">Trạng thái hiển thị</span>
                  <span class="block text-body-sm text-outline"
                    >Tắt để ẩn nghệ sĩ khỏi người nghe</span
                  >
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  class="peer sr-only"
                  [formField]="artistForm.isActive"
                />
                <span
                  class="relative h-6 w-11 shrink-0 rounded-full bg-surface-container-high transition-colors peer-checked:bg-secondary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
                  aria-hidden="true"
                ></span>
              </label>
            </section>
          </div>

          @if (serverErrors().length) {
            <div class="lg:col-span-3">
              <app-form-alert [messages]="serverErrors()" />
            </div>
          }
        </div>

        <!-- Thanh lưu dính phía dưới (nằm trên thanh phát nhạc cao 96px) -->
        <div
          class="sticky bottom-24 z-30 flex flex-col gap-3 border-t border-surface-variant bg-surface-container-low px-space-md py-4 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] sm:flex-row sm:items-center sm:justify-between sm:px-space-lg"
        >
          <p class="flex items-center gap-2 text-body-sm text-outline">
            <span class="material-symbols-outlined text-[18px]! text-primary" aria-hidden="true"
              >info</span
            >
            Nghệ sĩ đang hiển thị sẽ xuất hiện ngay với người nghe sau khi lưu.
          </p>
          <div class="flex items-center justify-end gap-3">
            <a
              routerLink="/admin/artists"
              class="rounded-xl bg-surface-container-high px-6 py-2.5 font-label-md text-on-surface transition-all hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-secondary"
            >
              Huỷ bỏ
            </a>
            <button
              type="submit"
              [disabled]="artistForm().submitting()"
              class="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-label-md text-on-primary shadow-[0_0_16px_rgba(208,188,255,0.4)] transition-all hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span class="material-symbols-outlined text-[18px]!" aria-hidden="true"
                >check_circle</span
              >
              {{
                artistForm().submitting()
                  ? 'Đang lưu...'
                  : isEdit()
                    ? 'Lưu thay đổi'
                    : 'Thêm nghệ sĩ'
              }}
            </button>
          </div>
        </div>
      </form>
    }
  `,
})
export class ArtistForm {
  private readonly artistService = inject(ArtistAdminService);
  private readonly mediaService = inject(MediaAdminService);
  private readonly router = inject(Router);

  /** Lấy từ tham số :id của route (withComponentInputBinding); không có = thêm mới. */
  readonly id = input<string>();

  protected readonly inputClass = INPUT_CLASS;
  protected readonly bioMaxLength = BIO_MAX_LENGTH;
  protected readonly isEdit = computed(() => !!this.id());
  protected readonly pageTitle = computed(() =>
    this.isEdit() ? 'Sửa nghệ sĩ' : 'Thêm nghệ sĩ mới',
  );

  // Chỉ gọi API khi có id (params trả undefined thì rxResource không tải).
  protected readonly artist = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.artistService.getArtist(id),
  });
  protected readonly loadError = computed(() => getApiErrors(this.artist.error())[0]);

  // Tải xong nghệ sĩ thì form lấy lại dữ liệu từ nghệ sĩ.
  protected readonly model = linkedSignal(() =>
    toFormModel(this.artist.hasValue() ? this.artist.value() : null),
  );
  protected readonly serverErrors = signal<string[]>([]);
  // Đang sửa thì giữ nguyên slug cũ; thêm mới thì slug chạy theo tên cho tới khi admin tự gõ slug.
  private readonly slugEdited = linkedSignal(() => this.isEdit());
  // Ảnh đã upload trong lần mở trang này nhưng chưa lưu vào nghệ sĩ.
  private readonly pendingUploads = new Set<string>();

  // Quy tắc giống CreateUpdateArtistRequest ở backend.
  protected readonly artistForm = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Vui lòng nhập tên nghệ sĩ.' });
      maxLength(path.name, 250, { message: 'Tên nghệ sĩ tối đa 250 ký tự.' });

      required(path.slug, { message: 'Vui lòng nhập slug.' });
      maxLength(path.slug, 250, { message: 'Slug tối đa 250 ký tự.' });
      pattern(path.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message: 'Slug chỉ gồm chữ thường không dấu, số và dấu "-" (ví dụ: son-tung-mtp).',
      });

      maxLength(path.bio, BIO_MAX_LENGTH, { message: 'Tiểu sử tối đa 2000 ký tự.' });
    },
    {
      submission: {
        action: async () => {
          this.serverErrors.set([]);
          const value = this.model();
          const request: CreateUpdateArtistRequest = {
            name: value.name.trim(),
            slug: value.slug,
            bio: value.bio.trim() || null,
            avatarUrl: value.avatarUrl || null,
            coverImageUrl: value.coverImageUrl || null,
            isFeatured: value.isFeatured,
            isActive: value.isActive,
          };
          const id = this.id();
          try {
            const saved = await firstValueFrom(
              id
                ? this.artistService.updateArtist(id, request)
                : this.artistService.createArtist(request),
            );
            // Ảnh mới đã thuộc về nghệ sĩ; ảnh cũ (nếu đổi) do API tự xoá.
            this.pendingUploads.clear();
            await this.router.navigateByUrl('/admin/artists', {
              state: {
                notice: id ? `Đã lưu nghệ sĩ "${saved.name}".` : `Đã thêm nghệ sĩ "${saved.name}".`,
              },
            });
          } catch (error) {
            this.serverErrors.set(getApiErrors(error));
          }
          return undefined;
        },
      },
    },
  );

  constructor() {
    // Rời trang (Huỷ, Quay lại, bấm menu...) mà chưa lưu thì xoá các ảnh vừa upload để không thành file rác.
    inject(DestroyRef).onDestroy(() => this.pendingUploads.forEach(this.deleteUpload));
  }

  protected readonly onNameInput = (name: string) => {
    if (!this.slugEdited()) {
      this.artistForm.slug().value.set(slugify(name));
    }
  };

  // Xoá trắng slug thì quay lại chế độ tự sinh theo tên.
  protected readonly onSlugInput = (slug: string) => this.slugEdited.set(slug.trim() !== '');

  /** Đổi / bỏ ảnh: ảnh cũ nếu là ảnh vừa upload (chưa lưu) thì xoá luôn trên R2. */
  protected readonly onImageChange = (field: ImageField, url: string) => {
    const oldUrl = this.model()[field];
    if (oldUrl && this.pendingUploads.has(oldUrl)) {
      this.deleteUpload(oldUrl);
    }
    if (url) {
      this.pendingUploads.add(url);
    }
    this.artistForm[field]().value.set(url);
  };

  // Lỗi thì bỏ qua (chỉ còn một file thừa trên R2).
  private readonly deleteUpload = (url: string) => {
    this.pendingUploads.delete(url);
    this.mediaService.deleteImage(url).subscribe({ error: () => undefined });
  };
}
