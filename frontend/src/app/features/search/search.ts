import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-search',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Tìm kiếm" icon="search" />`,
})
export class Search {}
