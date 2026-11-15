import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Khai báo cách hiển thị một cột của DataTable. Ví dụ:
 * <ng-template appCell="fullName" let-row>{{ row.fullName }}</ng-template>
 * Cột không có template thì bảng hiện thẳng giá trị row[key].
 */
@Directive({ selector: 'ng-template[appCell]' })
export class CellDef {
  readonly key = input.required<string>({ alias: 'appCell' });
  readonly template = inject(TemplateRef);
}
