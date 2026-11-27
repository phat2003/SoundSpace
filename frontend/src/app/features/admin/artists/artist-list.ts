import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ArtistAdminService } from '../../../core/admin/artist-admin.service';
import { getApiErrors } from '../../../core/http/api-error';
import { ArtistFilter, ArtistInList, ArtistStats } from '../../../core/models/artist';
import { PagedResult } from '../../../core/models/paged-result';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CellDef } from '../../../shared/components/data-table/cell-def';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { AdminPageHeader } from '../admin-page-header';

const PAGE_SIZE = 20;

const FILTERS: { value: ArtistFilter; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'hidden', label: 'Đang ẩn' },
  { value: 'featured', label: 'Nổi bật' },
];

// 4 thẻ số liệu; bấm vào thẻ thì lọc bảng theo đúng nhóm đó.
const STAT_CARDS: {
  key: keyof ArtistStats;
  filter: ArtistFilter;
  label: string;
  icon: string;
  tone: string;
}[] = [
  {
    key: 'total',
    filter: '',
    label: 'Tổng số nghệ sĩ',
    icon: 'groups',
    tone: 'bg-primary/15 text-primary',
  },
  {
    key: 'active',
    filter: 'active',
    label: 'Đang hiển thị',
    icon: 'visibility',
    tone: 'bg-secondary/15 text-secondary',
  },
  {
    key: 'featured',
    filter: 'featured',
    label: 'Nổi bật',
    icon: 'star',
    tone: 'bg-primary-container/20 text-primary',
  },
  {
    key: 'hidden',
    filter: 'hidden',
    label: 'Đang ẩn',
    icon: 'visibility_off',
    tone: 'bg-error-container/40 text-error',
  },
];

/**
 * Trang quản trị "Nghệ sĩ" theo mẫu Stitch "Quản lý nghệ sĩ": thẻ số liệu, tìm kiếm + lọc trạng thái, bảng, phân trang.
 * Đổi phần kiểm duyệt (chờ duyệt / xác minh / khoá — ngoài MVP) thành hiển thị / ẩn / nổi bật;
 * bỏ cột thể loại chính, lượt nghe / tháng và nút "Xuất báo cáo". Thêm / sửa ở trang riêng (ArtistForm).
 */
@Component({
  selector: 'app-artist-list',
  imports: [AdminPageHeader, CellDef, ConfirmDialog, DataTable, DatePipe, Pagination, RouterLink],
  host: {
    class:
      'mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-space-md py-space-xl sm:px-space-lg',
  },
  template: `
    <app-admin-page-header
      title="Nghệ sĩ"
      description="Quản lý hồ sơ nghệ sĩ, ảnh đại diện và trạng thái hiển thị trên SoundSpace."
    >
      <a
        routerLink="/admin/artists/new"
        class="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-label-md text-on-primary shadow-[0_0_20px_rgba(208,188,255,0.35)] transition-all hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
      >
        <span class="material-symbols-outlined text-[20px]!" aria-hidden="true">add</span>
        Thêm nghệ sĩ mới
      </a>
    </app-admin-page-header>

    <!-- Thẻ số liệu -->
    <div class="grid grid-cols-2 gap-gutter xl:grid-cols-4">
      @for (card of statCards; track card.key) {
        <button
          type="button"
          [attr.aria-pressed]="status() === card.filter"
          [attr.aria-label]="card.label + ': ' + statValue(card.key) + '. Bấm để lọc.'"
          class="group relative overflow-hidden rounded-2xl bg-surface-container-low/80 p-5 text-left shadow-lg backdrop-blur-xl transition-all hover:bg-surface-container/90 focus-visible:outline-2 focus-visible:outline-secondary aria-pressed:ring-2 aria-pressed:ring-primary/40"
          (click)="setStatus(card.filter)"
        >
          <span class="flex items-start justify-between gap-3">
            <span>
              <span class="block font-label-sm text-on-surface-variant">{{ card.label }}</span>
              <span class="mt-2 block font-headline-lg text-on-surface">{{
                statValue(card.key)
              }}</span>
            </span>
            <span
              class="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              [class]="card.tone"
              aria-hidden="true"
              >{{ card.icon }}</span
            >
          </span>
        </button>
      }
    </div>

    <section
      aria-label="Danh sách nghệ sĩ"
      class="flex flex-col gap-6 rounded-2xl bg-surface-container-low/80 p-4 shadow-xl backdrop-blur-xl sm:p-8"
    >
      <div class="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
        <form role="search" class="relative w-full max-w-md" (submit)="search($event, query.value)">
          <label for="admin-artist-search" class="sr-only">Tìm nghệ sĩ</label>
          <span
            class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px]! text-outline"
            aria-hidden="true"
            >search</span
          >
          <input
            #query
            id="admin-artist-search"
            type="search"
            placeholder="Tìm theo tên nghệ sĩ, nhấn Enter..."
            class="w-full rounded-xl bg-surface-container-lowest py-2.5 pr-4 pl-11 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none"
          />
        </form>
        <div
          role="group"
          aria-label="Lọc theo trạng thái"
          class="flex flex-wrap items-center gap-1 rounded-xl bg-surface-container-lowest p-1"
        >
          @for (filter of filters; track filter.value) {
            <button
              type="button"
              [attr.aria-pressed]="status() === filter.value"
              class="rounded-lg px-3.5 py-1.5 font-label-sm transition-all focus-visible:outline-2 focus-visible:outline-secondary"
              [class]="
                status() === filter.value
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              "
              (click)="setStatus(filter.value)"
            >
              {{ filter.label }}
            </button>
          }
        </div>
      </div>

      @if (notice(); as message) {
        <p role="status" class="flex items-center gap-2 text-body-md text-secondary">
          <span class="material-symbols-outlined text-lg!" aria-hidden="true">check_circle</span>
          {{ message }}
        </p>
      }

      <app-data-table
        caption="Danh sách nghệ sĩ"
        [columns]="columns"
        [rows]="page()?.results ?? []"
        [loading]="artists.isLoading()"
        [errorMessage]="errorMessage()"
        [emptyText]="emptyText()"
        (retry)="artists.reload()"
      >
        <ng-template appCell="name" let-artist>
          <div class="flex items-center gap-3.5">
            @if (artist.avatarUrl) {
              <img
                [src]="artist.avatarUrl"
                alt=""
                class="h-11 w-11 shrink-0 rounded-full bg-surface-container-high object-cover"
                [class.opacity-60]="!artist.isActive"
              />
            } @else {
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-md text-on-primary-container"
                aria-hidden="true"
                >{{ artist.name.charAt(0).toUpperCase() }}</span
              >
            }
            <div class="min-w-0">
              <p class="flex items-center gap-1.5">
                <span
                  class="max-w-56 truncate font-headline-sm"
                  [class]="artist.isActive ? 'text-on-surface' : 'text-on-surface-variant'"
                  >{{ artist.name }}</span
                >
                @if (artist.isFeatured) {
                  <span
                    class="material-symbols-outlined icon-filled text-[16px]! text-secondary"
                    title="Nghệ sĩ nổi bật"
                    aria-label="Nổi bật"
                    >star</span
                  >
                }
              </p>
              <p class="max-w-56 truncate text-body-sm text-outline">{{ artist.slug }}</p>
            </div>
          </div>
        </ng-template>
        <ng-template appCell="products" let-artist>
          <span class="text-on-surface-variant"
            >{{ artist.songCount }} bài hát • {{ artist.albumCount }} album</span
          >
        </ng-template>
        <ng-template appCell="isActive" let-artist>
          @if (artist.isActive) {
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 font-label-sm text-secondary"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true"></span>
              Đang hiển thị
            </span>
          } @else {
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-error-container/40 px-3 py-1 font-label-sm text-error"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-error" aria-hidden="true"></span>
              Đang ẩn
            </span>
          }
        </ng-template>
        <ng-template appCell="dateModified" let-artist>
          <span class="text-outline">{{
            artist.dateModified ?? artist.dateCreated | date: 'HH:mm dd/MM/yyyy'
          }}</span>
        </ng-template>
        <ng-template appCell="actions" let-artist>
          <div class="flex items-center justify-end gap-2">
            <a
              [routerLink]="['/admin/artists', artist.id, 'edit']"
              [attr.aria-label]="'Sửa nghệ sĩ ' + artist.name"
              title="Sửa"
              class="rounded-lg bg-surface-container-high p-2 text-on-surface-variant transition-all hover:text-primary focus-visible:outline-2 focus-visible:outline-secondary"
            >
              <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">edit</span>
            </a>
            <button
              type="button"
              [attr.aria-label]="'Xoá nghệ sĩ ' + artist.name"
              title="Xoá"
              class="rounded-lg bg-error-container/30 p-2 text-error transition-all hover:bg-error hover:text-on-error focus-visible:outline-2 focus-visible:outline-secondary"
              (click)="askDelete(artist)"
            >
              <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">delete</span>
            </button>
          </div>
        </ng-template>
      </app-data-table>

      @if (page(); as data) {
        <app-pagination
          [currentPage]="data.currentPage"
          [pageSize]="data.pageSize"
          [rowCount]="data.rowCount"
          (pageChange)="pageIndex.set($event)"
        />
      }
    </section>

    @if (deleteTarget(); as artist) {
      <app-confirm-dialog
        title="Xoá nghệ sĩ?"
        [message]="deleteMessage(artist)"
        confirmLabel="Xoá"
        [busy]="deleting()"
        [errorMessage]="deleteError()"
        (confirmed)="confirmDelete(artist)"
        (cancelled)="deleteTarget.set(null)"
      />
    }
  `,
})
export class ArtistList {
  private readonly artistService = inject(ArtistAdminService);

  protected readonly filters = FILTERS;
  protected readonly statCards = STAT_CARDS;
  protected readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nghệ sĩ' },
    { key: 'products', label: 'Sản phẩm âm nhạc', hideOnMobile: true },
    { key: 'isActive', label: 'Trạng thái' },
    { key: 'dateModified', label: 'Cập nhật', hideOnMobile: true },
    { key: 'actions', label: 'Thao tác', align: 'end' },
  ];

  private readonly keyword = signal('');
  protected readonly status = signal<ArtistFilter>('');
  protected readonly pageIndex = signal(1);

  // Đổi từ khoá, bộ lọc hoặc trang thì rxResource tự gọi lại API.
  protected readonly artists = rxResource({
    params: () => ({ keyword: this.keyword(), status: this.status(), pageIndex: this.pageIndex() }),
    stream: ({ params }) =>
      this.artistService.getArtistsPaging(
        params.keyword,
        params.status,
        params.pageIndex,
        PAGE_SIZE,
      ),
  });
  protected readonly stats = rxResource({ stream: () => this.artistService.getStats() });

  // Giữ trang cũ trong lúc tải trang mới để bảng không bị nháy trống.
  protected readonly page = linkedSignal<
    PagedResult<ArtistInList> | undefined,
    PagedResult<ArtistInList> | undefined
  >({
    source: () => (this.artists.hasValue() ? this.artists.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() =>
    this.artists.error() ? getApiErrors(this.artists.error())[0] : null,
  );

  protected readonly emptyText = computed(() =>
    this.keyword() || this.status()
      ? 'Không có nghệ sĩ nào khớp với tìm kiếm / bộ lọc.'
      : 'Chưa có nghệ sĩ nào. Bấm "Thêm nghệ sĩ mới" để tạo.',
  );

  /** Thông báo thành công: lấy từ trang Thêm / Sửa (router state) hoặc sau khi xoá. */
  protected readonly notice = signal<string | null>(
    inject(Router).currentNavigation()?.extras.state?.['notice'] ?? null,
  );
  protected readonly deleteTarget = signal<ArtistInList | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  /** Số trên thẻ; chưa tải xong hoặc lỗi thì hiện "—". */
  protected readonly statValue = (key: keyof ArtistStats) =>
    this.stats.hasValue() ? this.stats.value()[key].toLocaleString('vi-VN') : '—';

  protected readonly search = (event: Event, query: string) => {
    event.preventDefault();
    this.keyword.set(query.trim());
    this.pageIndex.set(1);
  };

  protected readonly setStatus = (status: ArtistFilter) => {
    this.status.set(status);
    this.pageIndex.set(1);
  };

  protected readonly deleteMessage = (artist: ArtistInList) =>
    `Nghệ sĩ "${artist.name}" cùng ảnh đại diện, ảnh bìa sẽ bị xoá vĩnh viễn. Nghệ sĩ đang có album hoặc bài hát thì không xoá được, hãy ẩn thay vì xoá.`;

  protected readonly askDelete = (artist: ArtistInList) => {
    this.notice.set(null);
    this.deleteError.set(null);
    this.deleteTarget.set(artist);
  };

  protected readonly confirmDelete = async (artist: ArtistInList) => {
    this.deleting.set(true);
    this.deleteError.set(null);
    try {
      await firstValueFrom(this.artistService.deleteArtists([artist.id]));
      this.deleteTarget.set(null);
      this.notice.set(`Đã xoá nghệ sĩ "${artist.name}".`);
      this.stats.reload();
      // Xoá dòng cuối cùng của một trang (không phải trang 1) thì lùi về trang trước.
      const current = this.page();
      if (current && current.results.length === 1 && this.pageIndex() > 1) {
        this.pageIndex.update((index) => index - 1);
      } else {
        this.artists.reload();
      }
    } catch (error) {
      this.deleteError.set(getApiErrors(error)[0]);
    } finally {
      this.deleting.set(false);
    }
  };
}
