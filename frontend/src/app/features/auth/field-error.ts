import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/** Hiện lỗi đầu tiên của một ô nhập, chỉ sau khi người dùng đã chạm vào ô (hoặc bấm gửi form). */
@Component({
  selector: 'app-field-error',
  template: `
    @if (message(); as message) {
      <p [id]="id()" class="flex items-center gap-1 pt-1 text-body-sm text-error" role="alert">
        <span class="material-symbols-outlined text-[16px]!" aria-hidden="true">error</span>
        {{ message }}
      </p>
    }
  `,
})
export class FieldError {
  readonly field = input.required<FieldTree<string>>();
  /** Gắn vào aria-describedby của ô nhập để trình đọc màn hình đọc được lỗi. */
  readonly id = input.required<string>();

  protected readonly message = computed(() => {
    const state = this.field()();
    return state.touched() ? state.errors()[0]?.message : undefined;
  });
}
