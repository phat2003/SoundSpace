import { Component, computed, input, output } from '@angular/core';

/** Thanh phân trang dưới bảng: "Hiển thị 1–20 / 57" và nút trang trước / trang sau. Trang đầu tiên là 1. */
@Component({
  selector: 'app-pagination',
  host: { class: 'flex flex-wrap items-center justify-between gap-3' },
  template: `
    @if (rowCount() > 0) {
      <p class="text-body-sm text-outline" aria-live="polite">
        Hiển thị {{ firstRow() }}–{{ lastRow() }} / {{ rowCount() }}
      </p>
      <nav aria-label="Phân trang" class="flex items-center gap-2">
        <button
          type="button"
          [disabled]="currentPage() <= 1"
          aria-label="Trang trước"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-40"
          (click)="pageChange.emit(currentPage() - 1)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        </button>
        <span class="px-2 font-label-md text-on-surface"
          >Trang {{ currentPage() }} / {{ pageCount() }}</span
        >
        <button
          type="button"
          [disabled]="currentPage() >= pageCount()"
          aria-label="Trang sau"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-40"
          (click)="pageChange.emit(currentPage() + 1)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
      </nav>
    }
  `,
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly rowCount = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.rowCount() / this.pageSize())),
  );
  protected readonly firstRow = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  protected readonly lastRow = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.rowCount()),
  );
}
