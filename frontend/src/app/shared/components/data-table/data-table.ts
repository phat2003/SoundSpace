import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChildren, input, output } from '@angular/core';
import { CellDef } from './cell-def';

export interface TableColumn {
  key: string;
  label: string;
  /** Căn phải cho cột số liệu / thao tác. */
  align?: 'start' | 'end';
  /** Ẩn cột trên màn hình nhỏ (dưới md) cho đỡ chật. */
  hideOnMobile?: boolean;
}

// Số dòng khung chờ hiện trong lần tải đầu tiên.
const SKELETON_ROWS = [1, 2, 3, 4, 5];

/**
 * Bảng dùng chung cho các trang quản trị (theo bảng "Quản lý kho nhạc gần đây" của mẫu Stitch).
 * Tự lo các trạng thái đang tải / lỗi / không có dữ liệu; nội dung từng ô do trang cha khai báo bằng CellDef.
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  host: { class: 'block overflow-x-auto' },
  template: `
    <table
      class="w-full border-collapse text-left transition-opacity"
      [class.opacity-60]="loading() && rows().length"
      [attr.aria-busy]="loading()"
    >
      <caption class="sr-only">
        {{
          caption()
        }}
      </caption>
      <thead>
        <tr class="border-b border-surface-container-high text-body-sm text-outline">
          @for (column of columns(); track column.key) {
            <th
              scope="col"
              class="px-3 pb-3 font-medium"
              [class.text-right]="column.align === 'end'"
              [class.max-md:hidden]="column.hideOnMobile"
            >
              {{ column.label }}
            </th>
          }
        </tr>
      </thead>
      <tbody class="divide-y divide-surface-container-high text-body-md">
        @if (errorMessage()) {
          <tr>
            <td [attr.colspan]="columns().length" class="py-12 text-center">
              <div role="alert" class="flex flex-col items-center gap-3">
                <span class="material-symbols-outlined text-4xl! text-error" aria-hidden="true"
                  >error</span
                >
                <p class="text-on-surface-variant">{{ errorMessage() }}</p>
                <button
                  type="button"
                  class="rounded-xl bg-surface-container-high px-4 py-2 font-label-md text-on-surface hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-secondary"
                  (click)="retry.emit()"
                >
                  Thử lại
                </button>
              </div>
            </td>
          </tr>
        } @else if (loading() && !rows().length) {
          @for (skeleton of skeletonRows; track skeleton) {
            <tr class="animate-pulse">
              @for (column of columns(); track column.key) {
                <td class="px-3 py-4" [class.max-md:hidden]="column.hideOnMobile">
                  <div class="h-4 rounded bg-surface-container-high"></div>
                </td>
              }
            </tr>
          }
        } @else {
          @for (row of rows(); track $index) {
            <tr class="transition-colors hover:bg-surface/50">
              @for (column of columns(); track column.key) {
                <td
                  class="px-3 py-4"
                  [class.text-right]="column.align === 'end'"
                  [class.max-md:hidden]="column.hideOnMobile"
                >
                  @if (cellTemplate(column.key); as template) {
                    <ng-container
                      [ngTemplateOutlet]="template"
                      [ngTemplateOutletContext]="{ $implicit: row }"
                    />
                  } @else {
                    {{ $any(row)[column.key] }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td
                [attr.colspan]="columns().length"
                class="py-12 text-center text-on-surface-variant"
              >
                {{ emptyText() }}
              </td>
            </tr>
          }
        }
      </tbody>
    </table>
  `,
})
export class DataTable<T> {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<readonly T[]>();
  /** Tên bảng cho trình đọc màn hình (không hiện ra giao diện). */
  readonly caption = input.required<string>();
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly emptyText = input('Không có dữ liệu.');
  /** Người dùng bấm "Thử lại" khi tải lỗi. */
  readonly retry = output<void>();

  private readonly cellDefs = contentChildren(CellDef);
  protected readonly skeletonRows = SKELETON_ROWS;

  protected readonly cellTemplate = (key: string) =>
    this.cellDefs().find((cell) => cell.key() === key)?.template ?? null;
}
