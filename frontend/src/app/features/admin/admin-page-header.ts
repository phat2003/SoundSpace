import { Component, input } from '@angular/core';

/** Phần đầu của mỗi trang quản trị: tiêu đề, mô tả và chỗ đặt nút thao tác (ví dụ "Thêm mới") qua ng-content. */
@Component({
  selector: 'app-admin-page-header',
  host: { class: 'flex flex-col justify-between gap-4 sm:flex-row sm:items-end' },
  template: `
    <div>
      <p class="font-label-sm tracking-wider text-outline uppercase">Quản trị</p>
      <h1 class="mt-1 font-headline-lg text-on-surface">{{ title() }}</h1>
      @if (description()) {
        <p class="mt-1 text-body-md text-outline">{{ description() }}</p>
      }
    </div>
    <div class="flex shrink-0 flex-wrap items-center gap-3">
      <ng-content />
    </div>
  `,
})
export class AdminPageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
}
