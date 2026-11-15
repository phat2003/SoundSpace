import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/components/page-placeholder/page-placeholder';

@Component({
  selector: 'app-admin',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder title="Tổng quan quản trị" icon="dashboard" />`,
})
export class Admin {}
