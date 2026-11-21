import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { GenreAdminService } from '../../../core/admin/genre-admin.service';
import { getApiErrors } from '../../../core/http/api-error';
import { Genre } from '../../../core/models/genre';
import { PagedResult } from '../../../core/models/paged-result';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CellDef } from '../../../shared/components/data-table/cell-def';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { AdminPageHeader } from '../admin-page-header';
import { GenreFormDialog } from './genre-form-dialog';

const PAGE_SIZE = 20;

/**
 * Trang quản trị "Thể loại": danh sách có tìm kiếm + phân trang, thêm / sửa trong hộp thoại, xoá có xác nhận.
 * Bảng theo kiểu bảng "Quản lý bài hát" của mẫu Stitch "Quản trị" (cột Thao tác với nút sửa / xoá).
 */
@Component({
  selector: 'app-genre-list',
  imports: [
    AdminPageHeader,
    CellDef,
    ConfirmDialog,
    DataTable,
    DatePipe,
    GenreFormDialog,
    Pagination,
  ],
  host: {
    class:
      'mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-space-md py-space-xl sm:px-space-lg',
  },
  template: `
    <app-admin-page-header
      title="Thể loại"
      description="Thể loại hiện ở trang Khám phá thể loại và dùng để phân loại bài hát."
    >
      <button
        type="button"
        class="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-label-md text-on-primary shadow-[0_0_15px_rgba(208,188,255,0.3)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        (click)="openForm(null)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
        Thêm thể loại
      </button>
    </app-admin-page-header>

    <section
      aria-label="Danh sách thể loại"
      class="flex flex-col gap-6 rounded-3xl bg-surface-container-low p-4 sm:p-8"
    >
      <form role="search" class="relative w-full max-w-96" (submit)="search($event, query.value)">
        <label for="admin-genre-search" class="sr-only">Tìm thể loại</label>
        <span
          class="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline"
          aria-hidden="true"
          >search</span
        >
        <input
          #query
          id="admin-genre-search"
          type="search"
          placeholder="Tìm theo tên thể loại, nhấn Enter..."
          class="w-full rounded-xl bg-surface py-2 pr-4 pl-10 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none"
        />
      </form>

      @if (notice(); as message) {
        <p role="status" class="flex items-center gap-2 text-body-md text-secondary">
          <span class="material-symbols-outlined text-lg!" aria-hidden="true">check_circle</span>
          {{ message }}
        </p>
      }

      <app-data-table
        caption="Danh sách thể loại"
        [columns]="columns"
        [rows]="page()?.results ?? []"
        [loading]="genres.isLoading()"
        [errorMessage]="errorMessage()"
        [emptyText]="emptyText()"
        (retry)="genres.reload()"
      >
        <ng-template appCell="name" let-genre>
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary"
            >
              @if (genre.coverImageUrl) {
                <img [src]="genre.coverImageUrl" alt="" class="h-full w-full object-cover" />
              } @else {
                <span class="material-symbols-outlined" aria-hidden="true">{{
                  genre.icon || 'category'
                }}</span>
              }
            </div>
            <div class="min-w-0">
              <p class="max-w-56 truncate font-semibold text-on-surface">{{ genre.name }}</p>
              <p class="max-w-56 truncate text-body-sm text-outline">{{ genre.slug }}</p>
            </div>
          </div>
        </ng-template>
        <ng-template appCell="isActive" let-genre>
          @if (genre.isActive) {
            <span class="rounded-full bg-secondary/10 px-2.5 py-1 text-body-sm text-secondary"
              >Hiển thị</span
            >
          } @else {
            <span
              class="rounded-full bg-surface-container-high px-2.5 py-1 text-body-sm text-outline"
              >Đang ẩn</span
            >
          }
        </ng-template>
        <ng-template appCell="dateModified" let-genre>
          <span class="text-outline">{{
            genre.dateModified ?? genre.dateCreated | date: 'HH:mm dd/MM/yyyy'
          }}</span>
        </ng-template>
        <ng-template appCell="actions" let-genre>
          <div class="flex items-center justify-end gap-1">
            <button
              type="button"
              [attr.aria-label]="'Sửa thể loại ' + genre.name"
              title="Sửa"
              class="rounded-lg p-2 text-outline transition-colors hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-secondary"
              (click)="openForm(genre)"
            >
              <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">edit</span>
            </button>
            <button
              type="button"
              [attr.aria-label]="'Xoá thể loại ' + genre.name"
              title="Xoá"
              class="rounded-lg p-2 text-outline transition-colors hover:bg-surface hover:text-error focus-visible:outline-2 focus-visible:outline-secondary"
              (click)="askDelete(genre)"
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

    @if (formTarget(); as target) {
      <app-genre-form-dialog
        [genre]="target === 'new' ? null : target"
        (saved)="onSaved($event, target === 'new')"
        (closed)="formTarget.set(null)"
      />
    }

    @if (deleteTarget(); as genre) {
      <app-confirm-dialog
        title="Xoá thể loại?"
        [message]="deleteMessage(genre)"
        confirmLabel="Xoá"
        [busy]="deleting()"
        [errorMessage]="deleteError()"
        (confirmed)="confirmDelete(genre)"
        (cancelled)="deleteTarget.set(null)"
      />
    }
  `,
})
export class GenreList {
  private readonly genreService = inject(GenreAdminService);

  protected readonly columns: TableColumn[] = [
    { key: 'name', label: 'Thể loại' },
    { key: 'sortOrder', label: 'Thứ tự', hideOnMobile: true },
    { key: 'isActive', label: 'Trạng thái' },
    { key: 'dateModified', label: 'Cập nhật', hideOnMobile: true },
    { key: 'actions', label: 'Thao tác', align: 'end' },
  ];

  private readonly keyword = signal('');
  protected readonly pageIndex = signal(1);

  // Đổi từ khoá hoặc trang thì rxResource tự gọi lại API.
  protected readonly genres = rxResource({
    params: () => ({ keyword: this.keyword(), pageIndex: this.pageIndex() }),
    stream: ({ params }) =>
      this.genreService.getGenresPaging(params.keyword, params.pageIndex, PAGE_SIZE),
  });

  // Giữ trang cũ trong lúc tải trang mới để bảng không bị nháy trống.
  protected readonly page = linkedSignal<
    PagedResult<Genre> | undefined,
    PagedResult<Genre> | undefined
  >({
    source: () => (this.genres.hasValue() ? this.genres.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() =>
    this.genres.error() ? getApiErrors(this.genres.error())[0] : null,
  );

  protected readonly emptyText = computed(() =>
    this.keyword()
      ? `Không tìm thấy thể loại nào khớp với "${this.keyword()}".`
      : 'Chưa có thể loại nào. Bấm "Thêm thể loại" để tạo.',
  );

  /** Thông báo thành công hiện phía trên bảng. */
  protected readonly notice = signal<string | null>(null);
  /** Thể loại đang mở form: 'new' = thêm mới, null = form đóng. */
  protected readonly formTarget = signal<Genre | 'new' | null>(null);
  protected readonly deleteTarget = signal<Genre | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly search = (event: Event, query: string) => {
    event.preventDefault();
    this.keyword.set(query.trim());
    this.pageIndex.set(1);
  };

  protected readonly openForm = (genre: Genre | null) => {
    this.notice.set(null);
    this.formTarget.set(genre ?? 'new');
  };

  protected readonly onSaved = (genre: Genre, isNew: boolean) => {
    this.formTarget.set(null);
    this.notice.set(
      isNew ? `Đã thêm thể loại "${genre.name}".` : `Đã lưu thể loại "${genre.name}".`,
    );
    this.genres.reload();
  };

  protected readonly deleteMessage = (genre: Genre) =>
    `Thể loại "${genre.name}" sẽ bị xoá vĩnh viễn. Thể loại đang có bài hát thì không xoá được, hãy ẩn thay vì xoá.`;

  protected readonly askDelete = (genre: Genre) => {
    this.notice.set(null);
    this.deleteError.set(null);
    this.deleteTarget.set(genre);
  };

  protected readonly confirmDelete = async (genre: Genre) => {
    this.deleting.set(true);
    this.deleteError.set(null);
    try {
      await firstValueFrom(this.genreService.deleteGenres([genre.id]));
      this.deleteTarget.set(null);
      this.notice.set(`Đã xoá thể loại "${genre.name}".`);
      // Xoá dòng cuối cùng của một trang (không phải trang 1) thì lùi về trang trước.
      const current = this.page();
      if (current && current.results.length === 1 && this.pageIndex() > 1) {
        this.pageIndex.update((index) => index - 1);
      } else {
        this.genres.reload();
      }
    } catch (error) {
      this.deleteError.set(getApiErrors(error)[0]);
    } finally {
      this.deleting.set(false);
    }
  };
}
