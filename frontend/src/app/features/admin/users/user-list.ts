import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserAdminService } from '../../../core/admin/user-admin.service';
import { getApiErrors } from '../../../core/http/api-error';
import { PagedResult } from '../../../core/models/paged-result';
import { UserInList } from '../../../core/models/user-management';
import { CellDef } from '../../../shared/components/data-table/cell-def';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { AdminPageHeader } from '../admin-page-header';

const PAGE_SIZE = 20;

/**
 * Trang quản trị "Người dùng": danh sách có tìm kiếm + phân trang (GET api/admin/user/paging).
 * Khoá / mở tài khoản làm ở task "Quản lý người dùng".
 */
@Component({
  selector: 'app-user-list',
  imports: [AdminPageHeader, CellDef, DataTable, DatePipe, Pagination],
  host: {
    class:
      'mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-space-md py-space-xl sm:px-space-lg',
  },
  template: `
    <app-admin-page-header
      title="Người dùng"
      description="Danh sách tài khoản đã đăng ký trên SoundSpace."
    />

    <section
      aria-label="Danh sách người dùng"
      class="flex flex-col gap-6 rounded-3xl bg-surface-container-low p-4 sm:p-8"
    >
      <form role="search" class="relative w-full max-w-96" (submit)="search($event, query.value)">
        <label for="admin-user-search" class="sr-only">Tìm người dùng</label>
        <span
          class="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline"
          aria-hidden="true"
          >search</span
        >
        <input
          #query
          id="admin-user-search"
          type="search"
          placeholder="Tìm theo họ tên hoặc email, nhấn Enter..."
          class="w-full rounded-xl bg-surface py-2 pr-4 pl-10 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none"
        />
      </form>

      <app-data-table
        caption="Danh sách người dùng"
        [columns]="columns"
        [rows]="page()?.results ?? []"
        [loading]="users.isLoading()"
        [errorMessage]="errorMessage()"
        [emptyText]="emptyText()"
        (retry)="users.reload()"
      >
        <ng-template appCell="fullName" let-user>
          <div class="flex items-center gap-3">
            @if (user.avatarUrl) {
              <img
                [src]="user.avatarUrl"
                alt=""
                class="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            } @else {
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-md text-on-primary-container"
                aria-hidden="true"
                >{{ user.fullName.charAt(0).toUpperCase() }}</span
              >
            }
            <div class="min-w-0">
              <p class="max-w-56 truncate font-semibold text-on-surface">{{ user.fullName }}</p>
              <p class="max-w-56 truncate text-body-sm text-outline">{{ user.email }}</p>
            </div>
          </div>
        </ng-template>
        <ng-template appCell="isActive" let-user>
          @if (user.isActive) {
            <span class="inline-flex items-center gap-1.5 text-body-sm text-secondary-fixed">
              <span class="h-1.5 w-1.5 rounded-full bg-secondary-fixed" aria-hidden="true"></span>
              Hoạt động
            </span>
          } @else {
            <span class="inline-flex items-center gap-1.5 text-body-sm text-error">
              <span class="h-1.5 w-1.5 rounded-full bg-error" aria-hidden="true"></span>
              Đã khoá
            </span>
          }
        </ng-template>
        <ng-template appCell="lastLoginDate" let-user>
          <span class="text-outline">{{
            user.lastLoginDate ? (user.lastLoginDate | date: 'HH:mm dd/MM/yyyy') : 'Chưa có'
          }}</span>
        </ng-template>
        <ng-template appCell="dateCreated" let-user>
          <span class="text-outline">{{ user.dateCreated | date: 'dd/MM/yyyy' }}</span>
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
  `,
})
export class UserList {
  private readonly userAdminService = inject(UserAdminService);

  protected readonly columns: TableColumn[] = [
    { key: 'fullName', label: 'Người dùng' },
    { key: 'isActive', label: 'Trạng thái' },
    { key: 'lastLoginDate', label: 'Đăng nhập gần nhất', hideOnMobile: true },
    { key: 'dateCreated', label: 'Ngày tạo', align: 'end', hideOnMobile: true },
  ];

  private readonly keyword = signal('');
  protected readonly pageIndex = signal(1);

  // Đổi từ khoá hoặc trang thì rxResource tự gọi lại API.
  protected readonly users = rxResource({
    params: () => ({ keyword: this.keyword(), pageIndex: this.pageIndex() }),
    stream: ({ params }) =>
      this.userAdminService.getUsersPaging(params.keyword, params.pageIndex, PAGE_SIZE),
  });

  // Giữ trang cũ trong lúc tải trang mới để bảng không bị nháy trống khi chuyển trang.
  protected readonly page = linkedSignal<
    PagedResult<UserInList> | undefined,
    PagedResult<UserInList> | undefined
  >({
    source: () => (this.users.hasValue() ? this.users.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly errorMessage = computed(() =>
    this.users.error() ? getApiErrors(this.users.error())[0] : null,
  );

  protected readonly emptyText = computed(() =>
    this.keyword()
      ? `Không tìm thấy người dùng nào khớp với "${this.keyword()}".`
      : 'Chưa có người dùng nào.',
  );

  /** Tìm từ trang 1 với từ khoá mới (ô trống = xem tất cả). */
  protected readonly search = (event: Event, query: string) => {
    event.preventDefault();
    this.keyword.set(query.trim());
    this.pageIndex.set(1);
  };
}
