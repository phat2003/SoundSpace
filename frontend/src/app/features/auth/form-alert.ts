import { Component, input } from '@angular/core';

/** Khung báo lỗi trả về từ API (sai mật khẩu, email đã dùng...), hiện phía trên nút gửi form. */
@Component({
  selector: 'app-form-alert',
  template: `
    @if (messages().length) {
      <div
        role="alert"
        class="flex gap-2 rounded-xl border border-error/30 bg-error-container/30 px-4 py-3 text-body-md text-on-error-container"
      >
        <span class="material-symbols-outlined text-lg! text-error" aria-hidden="true">error</span>
        <ul class="space-y-1">
          @for (message of messages(); track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      </div>
    }
  `,
})
export class FormAlert {
  readonly messages = input<string[]>([]);
}
